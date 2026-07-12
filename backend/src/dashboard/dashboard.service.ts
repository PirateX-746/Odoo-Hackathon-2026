import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { Prisma } from '@/generated/prisma/client';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import type { DashboardKpisDto } from './dto/dashboard-kpis.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(filters: DashboardQueryDto): Promise<DashboardKpisDto> {
    const vehicleWhere: Prisma.VehicleWhereInput = {};
    if (filters.region) vehicleWhere.region = filters.region;
    if (filters.type) vehicleWhere.type = filters.type;
    if (filters.status) vehicleWhere.status = filters.status;

    const [
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      onTripVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
    ] = await Promise.all([
      this.prisma.vehicle.count({
        where: { ...vehicleWhere, status: { not: 'RETIRED' } },
      }),
      this.prisma.vehicle.count({
        where: { ...vehicleWhere, status: 'AVAILABLE' },
      }),
      this.prisma.vehicle.count({
        where: { ...vehicleWhere, status: 'IN_SHOP' },
      }),
      this.prisma.vehicle.count({
        where: { ...vehicleWhere, status: 'ON_TRIP' },
      }),
      this.prisma.trip.count({ where: { status: 'DISPATCHED' } }),
      this.prisma.trip.count({ where: { status: 'DRAFT' } }),
      this.prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    ]);

    const fleetUtilizationPercent =
      activeVehicles > 0
        ? Math.round((onTripVehicles / activeVehicles) * 10000) / 100
        : 0;

    return {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPercent,
    };
  }
}
