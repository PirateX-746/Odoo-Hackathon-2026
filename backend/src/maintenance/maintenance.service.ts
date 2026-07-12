import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { MaintenanceLog } from '@/generated/prisma/client';
import {
  buildPaginatedResult,
  paginationSkipTake,
  type PaginatedResult,
} from '@/common/dto/pagination-query.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaintenanceDto): Promise<MaintenanceLog> {
    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: dto.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
      if (vehicle.status === 'ON_TRIP') {
        throw new ConflictException(
          'Cannot open maintenance while the vehicle is on a trip',
        );
      }
      if (vehicle.status === 'RETIRED') {
        throw new ConflictException('Vehicle is retired');
      }

      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: dto.vehicleId,
          type: dto.type,
          description: dto.description,
          cost: dto.cost,
          status: 'ACTIVE',
        },
      });

      await tx.vehicle.updateMany({
        where: { id: dto.vehicleId, status: { notIn: ['ON_TRIP', 'RETIRED'] } },
        data: { status: 'IN_SHOP' },
      });

      return log;
    });
  }

  async close(id: string): Promise<MaintenanceLog> {
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({ where: { id } });
      if (!log) {
        throw new NotFoundException('Maintenance log not found');
      }
      if (log.status !== 'ACTIVE') {
        throw new ConflictException('Maintenance log is already closed');
      }

      const closeFlip = await tx.maintenanceLog.updateMany({
        where: { id, status: 'ACTIVE' },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
      if (closeFlip.count === 0) {
        throw new ConflictException('Maintenance state changed concurrently');
      }

      // Only restore the vehicle if no other active maintenance logs remain for
      // it — otherwise closing one of two concurrent maintenance records would
      // incorrectly free the vehicle.
      const remainingActive = await tx.maintenanceLog.count({
        where: { vehicleId: log.vehicleId, status: 'ACTIVE' },
      });
      if (remainingActive === 0) {
        await tx.vehicle.updateMany({
          where: { id: log.vehicleId, status: 'IN_SHOP' },
          data: { status: 'AVAILABLE' },
        });
        // The WHERE clause requires status IN_SHOP, so a RETIRED vehicle is
        // never touched here — this is exactly how "unless retired" is
        // satisfied.
      }

      const updated = await tx.maintenanceLog.findUnique({ where: { id } });
      if (!updated) {
        throw new NotFoundException('Maintenance log not found');
      }
      return updated;
    });
  }

  async findAll(
    query: QueryMaintenanceDto,
  ): Promise<PaginatedResult<MaintenanceLog>> {
    const { skip, take } = paginationSkipTake(query);
    const where = {
      ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder }
      : { openedAt: query.sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.maintenanceLog.findMany({ where, skip, take, orderBy }),
      this.prisma.maintenanceLog.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query);
  }

  async findAllForVehicle(vehicleId: string): Promise<MaintenanceLog[]> {
    return this.prisma.maintenanceLog.findMany({
      where: { vehicleId },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<MaintenanceLog> {
    const log = await this.prisma.maintenanceLog.findUnique({
      where: { id },
    });
    if (!log) {
      throw new NotFoundException('Maintenance log not found');
    }
    return log;
  }
}
