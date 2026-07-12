import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecommendDispatchDto {
  @ApiProperty({ example: 'Pune' })
  @IsString()
  source!: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: 450 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  cargoWeightKg!: number;

  @ApiProperty({ example: 150 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  plannedDistanceKm!: number;

  @ApiPropertyOptional({ example: 'North' })
  @IsOptional()
  @IsString()
  region?: string;
}
