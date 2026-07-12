import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleReportDto {
  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  registrationNumber!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  region!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({
    description: 'Sum of actualDistanceKm across completed trips',
  })
  totalDistanceKm!: number;

  @ApiProperty({ description: 'Sum of liters across all fuel logs' })
  totalFuelLiters!: number;

  @ApiPropertyOptional({
    description:
      'totalDistanceKm / totalFuelLiters; null when no fuel has been logged',
    nullable: true,
  })
  fuelEfficiencyKmPerLiter!: number | null;

  @ApiProperty()
  totalFuelCost!: number;

  @ApiProperty()
  totalMaintenanceCost!: number;

  @ApiProperty({ description: 'totalFuelCost + totalMaintenanceCost' })
  operationalCost!: number;

  @ApiProperty({ description: 'Sum of revenue across completed trips' })
  totalRevenue!: number;

  @ApiProperty()
  acquisitionCost!: number;

  @ApiPropertyOptional({
    description:
      '(totalRevenue - operationalCost) / acquisitionCost; null when acquisitionCost is 0',
    nullable: true,
  })
  roi!: number | null;
}
