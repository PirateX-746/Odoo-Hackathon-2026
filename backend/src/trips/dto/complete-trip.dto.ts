import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CompleteTripDto {
  @ApiProperty({
    description: 'Final odometer reading; must exceed the start odometer.',
  })
  @IsNumber()
  @Min(0)
  endOdometerKm!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  fuelConsumedLiters!: number;

  @ApiPropertyOptional({
    description:
      'Optional revenue for this trip, used in Vehicle ROI reporting.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;
}
