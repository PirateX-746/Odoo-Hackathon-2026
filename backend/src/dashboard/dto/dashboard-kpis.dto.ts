import { ApiProperty } from '@nestjs/swagger';

export class DashboardKpisDto {
  @ApiProperty({ description: 'Vehicles with status != RETIRED' })
  activeVehicles!: number;

  @ApiProperty({ description: 'Vehicles with status = AVAILABLE' })
  availableVehicles!: number;

  @ApiProperty({ description: 'Vehicles with status = IN_SHOP' })
  vehiclesInMaintenance!: number;

  @ApiProperty({ description: 'Trips with status = DISPATCHED' })
  activeTrips!: number;

  @ApiProperty({ description: 'Trips with status = DRAFT' })
  pendingTrips!: number;

  @ApiProperty({ description: 'Drivers with status = ON_TRIP' })
  driversOnDuty!: number;

  @ApiProperty({ description: '(vehicles ON_TRIP / active vehicles) * 100' })
  fleetUtilizationPercent!: number;
}
