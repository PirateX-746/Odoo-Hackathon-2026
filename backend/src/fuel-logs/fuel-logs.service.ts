import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { FuelLog, Prisma } from '@/generated/prisma/client';
import { serializeDecimals } from '@/common/utils/decimal.util';
import {
  buildPaginatedResult,
  paginationSkipTake,
  type PaginatedResult,
} from '@/common/dto/pagination-query.dto';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { UpdateFuelLogDto } from './dto/update-fuel-log.dto';
import { QueryFuelLogDto } from './dto/query-fuel-log.dto';

@Injectable()
export class FuelLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFuelLogDto): Promise<FuelLog> {
    await this.assertVehicleExists(dto.vehicleId);
    if (dto.tripId) {
      await this.assertTripExists(dto.tripId);
    }

    const fuelLog = await this.prisma.fuelLog.create({
      data: {
        vehicleId: dto.vehicleId,
        tripId: dto.tripId,
        liters: dto.liters,
        cost: dto.cost,
        date: dto.date,
      },
    });
    return serializeDecimals(fuelLog);
  }

  async findAll(query: QueryFuelLogDto): Promise<PaginatedResult<FuelLog>> {
    const where: Prisma.FuelLogWhereInput = {
      ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
      ...(query.tripId ? { tripId: query.tripId } : {}),
    };

    const { skip, take } = paginationSkipTake(query);
    const [fuelLogs, total] = await Promise.all([
      this.prisma.fuelLog.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
      }),
      this.prisma.fuelLog.count({ where }),
    ]);

    return buildPaginatedResult(
      fuelLogs.map((fuelLog) => serializeDecimals(fuelLog)),
      total,
      query,
    );
  }

  async findByVehicle(vehicleId: string): Promise<FuelLog[]> {
    await this.assertVehicleExists(vehicleId);
    const fuelLogs = await this.prisma.fuelLog.findMany({
      where: { vehicleId },
      orderBy: { date: 'desc' },
    });
    return fuelLogs.map((fuelLog) => serializeDecimals(fuelLog));
  }

  async findOne(id: string): Promise<FuelLog> {
    const fuelLog = await this.prisma.fuelLog.findUnique({ where: { id } });
    if (!fuelLog) {
      throw new NotFoundException('Fuel log not found.');
    }
    return serializeDecimals(fuelLog);
  }

  async update(id: string, dto: UpdateFuelLogDto): Promise<FuelLog> {
    await this.findOne(id);
    if (dto.vehicleId) {
      await this.assertVehicleExists(dto.vehicleId);
    }
    if (dto.tripId) {
      await this.assertTripExists(dto.tripId);
    }

    const fuelLog = await this.prisma.fuelLog.update({
      where: { id },
      data: {
        ...(dto.vehicleId !== undefined ? { vehicleId: dto.vehicleId } : {}),
        ...(dto.tripId !== undefined ? { tripId: dto.tripId } : {}),
        ...(dto.liters !== undefined ? { liters: dto.liters } : {}),
        ...(dto.cost !== undefined ? { cost: dto.cost } : {}),
        ...(dto.date !== undefined ? { date: dto.date } : {}),
      },
    });
    return serializeDecimals(fuelLog);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.fuelLog.delete({ where: { id } });
  }

  private async assertVehicleExists(vehicleId: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }
  }

  private async assertTripExists(tripId: string): Promise<void> {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Trip not found.');
    }
  }
}
