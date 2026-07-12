import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { VehicleStatus } from '@/generated/prisma/enums';

export class CreateVehicleDto {
  @ApiProperty({ example: 'MH12AB1234' })
  @IsString()
  registrationNumber!: string;

  @ApiProperty({ example: 'Tata Ace' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Truck' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  maxLoadCapacityKg!: number;

  @ApiProperty({ example: 850000 })
  @IsNumber()
  @Min(0)
  acquisitionCost!: number;

  @ApiProperty({ example: 'North' })
  @IsString()
  region!: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
