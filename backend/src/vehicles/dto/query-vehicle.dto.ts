import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { VehicleStatus } from '@/generated/prisma/enums';

export class QueryVehicleDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ example: 'North' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Truck' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against registrationNumber or name',
    example: 'MH12',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class DispatchEligibleVehicleQueryDto {
  @ApiPropertyOptional({ example: 'North' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Truck' })
  @IsOptional()
  @IsString()
  type?: string;
}
