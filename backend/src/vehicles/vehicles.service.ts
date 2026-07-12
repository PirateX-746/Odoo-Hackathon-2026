import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { Prisma, Vehicle } from '@/generated/prisma/client';
import { VehicleStatus } from '@/generated/prisma/enums';
import { serializeDecimals } from '@/common/utils/decimal.util';
import {
  buildPaginatedResult,
  paginationSkipTake,
  type PaginatedResult,
} from '@/common/dto/pagination-query.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  DispatchEligibleVehicleQueryDto,
  QueryVehicleDto,
} from './dto/query-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.prisma.vehicle.findUnique({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) {
      throw new ConflictException(
        'A vehicle with this registration number already exists.',
      );
    }
    const vehicle = await this.prisma.vehicle.create({
      data: {
        registrationNumber: dto.registrationNumber,
        name: dto.name,
        type: dto.type,
        maxLoadCapacityKg: dto.maxLoadCapacityKg,
        acquisitionCost: dto.acquisitionCost,
        region: dto.region,
        odometerKm: dto.odometerKm ?? 0,
        status: dto.status ?? VehicleStatus.AVAILABLE,
      },
    });
    return serializeDecimals(vehicle);
  }

  async findAll(query: QueryVehicleDto): Promise<PaginatedResult<Vehicle>> {
    const where: Prisma.VehicleWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.region) where.region = query.region;
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { registrationNumber: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { skip, take } = paginationSkipTake(query);
    const orderBy: Prisma.VehicleOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder }
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({ where, skip, take, orderBy }),
      this.prisma.vehicle.count({ where }),
    ]);

    return buildPaginatedResult(
      data.map((vehicle) => serializeDecimals(vehicle)),
      total,
      query,
    );
  }

  async findDispatchEligible(
    query: DispatchEligibleVehicleQueryDto,
  ): Promise<Vehicle[]> {
    const where: Prisma.VehicleWhereInput = { status: VehicleStatus.AVAILABLE };
    if (query.region) where.region = query.region;
    if (query.type) where.type = query.type;

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return vehicles.map((vehicle) => serializeDecimals(vehicle));
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }
    return serializeDecimals(vehicle);
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    await this.findOne(id);
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
    return serializeDecimals(vehicle);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.vehicle.delete({ where: { id } });
  }
}
