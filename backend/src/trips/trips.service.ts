import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { serializeDecimals } from '@/common/utils/decimal.util';
import {
  buildPaginatedResult,
  paginationSkipTake,
  type PaginatedResult,
} from '@/common/dto/pagination-query.dto';
import type { Prisma, Trip } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/common/interfaces/jwt-payload.interface';
import { CreateTripDto } from './dto/create-trip.dto';
import { CompleteTripDto } from './dto/complete-trip.dto';
import { QueryTripDto } from './dto/query-trip.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto, createdById: string): Promise<Trip> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found.');
    if (vehicle.status !== 'AVAILABLE') {
      throw new ConflictException('Vehicle is not available for a new trip.');
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
    });
    if (!driver) throw new NotFoundException('Driver not found.');
    if (driver.status !== 'AVAILABLE') {
      throw new ConflictException('Driver is not available for a new trip.');
    }
    if (driver.licenseExpiryDate < new Date()) {
      throw new ConflictException('Driver license has expired.');
    }

    if (dto.cargoWeightKg > vehicle.maxLoadCapacityKg.toNumber()) {
      throw new UnprocessableEntityException(
        'Cargo weight exceeds vehicle maximum load capacity.',
      );
    }

    const trip = await this.prisma.trip.create({
      data: {
        source: dto.source,
        destination: dto.destination,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        cargoWeightKg: dto.cargoWeightKg,
        plannedDistanceKm: dto.plannedDistanceKm,
        createdById,
      },
    });
    return serializeDecimals(trip);
  }

  async findAll(query: QueryTripDto): Promise<PaginatedResult<Trip>> {
    const where: Prisma.TripWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
      ...(query.driverId ? { driverId: query.driverId } : {}),
      ...(query.search
        ? {
            OR: [
              { source: { contains: query.search, mode: 'insensitive' } },
              { destination: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const { skip, take } = paginationSkipTake(query);
    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take,
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder }
          : { createdAt: 'desc' },
      }),
      this.prisma.trip.count({ where }),
    ]);
    return buildPaginatedResult(
      data.map((trip) => serializeDecimals(trip)),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found.');
    return serializeDecimals(trip);
  }

  /**
   * Dispatching re-validates every business rule against fresh in-transaction data
   * (never trusts a pre-check made before the transaction started) and flips
   * vehicle/driver status via conditional updateMany compare-and-swap: if either
   * flip matches 0 rows, a concurrent dispatch already claimed them and the whole
   * transaction rolls back with a 409.
   */
  async dispatch(tripId: string): Promise<Trip> {
    const result = await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
      });
      if (!trip) throw new NotFoundException('Trip not found.');
      if (trip.status !== 'DRAFT') {
        throw new ConflictException(`Trip is ${trip.status}, expected DRAFT.`);
      }

      if (trip.driver.status === 'SUSPENDED') {
        throw new ConflictException('Driver is suspended.');
      }
      if (trip.driver.licenseExpiryDate < new Date()) {
        throw new ConflictException('Driver license has expired.');
      }
      if (trip.driver.status !== 'AVAILABLE') {
        throw new ConflictException('Driver is not available.');
      }
      if (
        trip.vehicle.status === 'RETIRED' ||
        trip.vehicle.status === 'IN_SHOP'
      ) {
        throw new ConflictException('Vehicle is not eligible for dispatch.');
      }
      if (trip.vehicle.status !== 'AVAILABLE') {
        throw new ConflictException('Vehicle is not available.');
      }
      if (trip.cargoWeightKg.greaterThan(trip.vehicle.maxLoadCapacityKg)) {
        throw new UnprocessableEntityException(
          'Cargo weight exceeds vehicle maximum load capacity.',
        );
      }

      const vehicleFlip = await tx.vehicle.updateMany({
        where: { id: trip.vehicleId, status: 'AVAILABLE' },
        data: { status: 'ON_TRIP' },
      });
      if (vehicleFlip.count === 0) {
        throw new ConflictException(
          'Vehicle is no longer available (concurrent dispatch).',
        );
      }

      const driverFlip = await tx.driver.updateMany({
        where: { id: trip.driverId, status: 'AVAILABLE' },
        data: { status: 'ON_TRIP' },
      });
      if (driverFlip.count === 0) {
        throw new ConflictException(
          'Driver is no longer available (concurrent dispatch).',
        );
      }

      return tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'DISPATCHED',
          dispatchedAt: new Date(),
          startOdometerKm: trip.vehicle.odometerKm,
        },
      });
    });
    return serializeDecimals(result);
  }

  async complete(
    tripId: string,
    dto: CompleteTripDto,
    actor: AuthenticatedUser,
  ): Promise<Trip> {
    const result = await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { driver: true },
      });
      if (!trip) throw new NotFoundException('Trip not found.');
      if (trip.status !== 'DISPATCHED') {
        throw new ConflictException(
          `Trip is ${trip.status}, expected DISPATCHED.`,
        );
      }
      if (actor.role === 'DRIVER' && trip.driver.userId !== actor.id) {
        throw new ForbiddenException('You may only complete your own trips.');
      }
      if (trip.startOdometerKm === null) {
        throw new ConflictException('Trip has no start odometer reading.');
      }
      if (dto.endOdometerKm <= trip.startOdometerKm.toNumber()) {
        throw new UnprocessableEntityException(
          'End odometer must exceed start odometer.',
        );
      }

      const actualDistanceKm =
        dto.endOdometerKm - trip.startOdometerKm.toNumber();

      const tripFlip = await tx.trip.updateMany({
        where: { id: tripId, status: 'DISPATCHED' },
        data: {
          status: 'COMPLETED',
          endOdometerKm: dto.endOdometerKm,
          actualDistanceKm,
          fuelConsumedLiters: dto.fuelConsumedLiters,
          revenue: dto.revenue ?? null,
          completedAt: new Date(),
        },
      });
      if (tripFlip.count === 0) {
        throw new ConflictException('Trip state changed concurrently.');
      }

      await tx.vehicle.updateMany({
        where: { id: trip.vehicleId, status: 'ON_TRIP' },
        data: { status: 'AVAILABLE', odometerKm: dto.endOdometerKm },
      });
      await tx.driver.updateMany({
        where: { id: trip.driverId, status: 'ON_TRIP' },
        data: { status: 'AVAILABLE' },
      });

      return tx.trip.findUniqueOrThrow({ where: { id: tripId } });
    });
    return serializeDecimals(result);
  }

  async cancel(tripId: string): Promise<Trip> {
    const result = await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new NotFoundException('Trip not found.');
      if (trip.status !== 'DRAFT' && trip.status !== 'DISPATCHED') {
        throw new ConflictException(
          `Cannot cancel a trip in status ${trip.status}.`,
        );
      }

      const tripFlip = await tx.trip.updateMany({
        where: { id: tripId, status: trip.status },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
      if (tripFlip.count === 0) {
        throw new ConflictException('Trip state changed concurrently.');
      }

      if (trip.status === 'DISPATCHED') {
        await tx.vehicle.updateMany({
          where: { id: trip.vehicleId, status: 'ON_TRIP' },
          data: { status: 'AVAILABLE' },
        });
        await tx.driver.updateMany({
          where: { id: trip.driverId, status: 'ON_TRIP' },
          data: { status: 'AVAILABLE' },
        });
      }

      return tx.trip.findUniqueOrThrow({ where: { id: tripId } });
    });
    return serializeDecimals(result);
  }
}
