import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { Prisma } from '@/generated/prisma/client';
import { ReportQueryDto } from './dto/report-query.dto';
import type { VehicleReportDto } from './dto/vehicle-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Per-vehicle report combining fuel efficiency, operational cost, and ROI.
   * Runs one aggregate query set per vehicle (in parallel) rather than a single
   * cross-table groupBy — simple and correct for hackathon-scale fleets; would
   * need to switch to a raw SQL rollup if the fleet grew into the thousands.
   */
  async getVehicleReports(
    filters: ReportQueryDto,
  ): Promise<VehicleReportDto[]> {
    const where: Prisma.VehicleWhereInput = {};
    if (filters.region) where.region = filters.region;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      vehicles.map(async (vehicle): Promise<VehicleReportDto> => {
        const [fuelAgg, maintenanceAgg, tripAgg] = await Promise.all([
          this.prisma.fuelLog.aggregate({
            where: { vehicleId: vehicle.id },
            _sum: { liters: true, cost: true },
          }),
          this.prisma.maintenanceLog.aggregate({
            where: { vehicleId: vehicle.id },
            _sum: { cost: true },
          }),
          this.prisma.trip.aggregate({
            where: { vehicleId: vehicle.id, status: 'COMPLETED' },
            _sum: { actualDistanceKm: true, revenue: true },
          }),
        ]);

        const totalFuelLiters = fuelAgg._sum.liters?.toNumber() ?? 0;
        const totalFuelCost = fuelAgg._sum.cost?.toNumber() ?? 0;
        const totalMaintenanceCost = maintenanceAgg._sum.cost?.toNumber() ?? 0;
        const totalDistanceKm = tripAgg._sum.actualDistanceKm?.toNumber() ?? 0;
        const totalRevenue = tripAgg._sum.revenue?.toNumber() ?? 0;
        const operationalCost = totalFuelCost + totalMaintenanceCost;
        const acquisitionCost = vehicle.acquisitionCost.toNumber();

        return {
          vehicleId: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          name: vehicle.name,
          region: vehicle.region,
          type: vehicle.type,
          totalDistanceKm,
          totalFuelLiters,
          fuelEfficiencyKmPerLiter:
            totalFuelLiters > 0 ? totalDistanceKm / totalFuelLiters : null,
          totalFuelCost,
          totalMaintenanceCost,
          operationalCost,
          totalRevenue,
          acquisitionCost,
          roi:
            acquisitionCost > 0
              ? (totalRevenue - operationalCost) / acquisitionCost
              : null,
        };
      }),
    );
  }

  async getFleetUtilization(filters: ReportQueryDto) {
    const where: Prisma.VehicleWhereInput = {};
    if (filters.region) where.region = filters.region;
    if (filters.type) where.type = filters.type;

    const [available, onTrip, inShop, retired] = await Promise.all([
      this.prisma.vehicle.count({ where: { ...where, status: 'AVAILABLE' } }),
      this.prisma.vehicle.count({ where: { ...where, status: 'ON_TRIP' } }),
      this.prisma.vehicle.count({ where: { ...where, status: 'IN_SHOP' } }),
      this.prisma.vehicle.count({ where: { ...where, status: 'RETIRED' } }),
    ]);
    const activeVehicles = available + onTrip + inShop;
    const utilizationPercent =
      activeVehicles > 0
        ? Math.round((onTrip / activeVehicles) * 10000) / 100
        : 0;

    return {
      availableVehicles: available,
      onTripVehicles: onTrip,
      inShopVehicles: inShop,
      retiredVehicles: retired,
      activeVehicles,
      utilizationPercent,
    };
  }
}
