import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFuelLogDto {
  @ApiProperty({ description: 'ID of the vehicle refuelled' })
  @IsUUID()
  vehicleId!: string;

  @ApiPropertyOptional({
    description: 'ID of the trip this fuel log is associated with',
  })
  @IsOptional()
  @IsUUID()
  tripId?: string;

  @ApiProperty({ example: 45.5, description: 'Liters of fuel added' })
  @IsNumber()
  @Min(0)
  liters!: number;

  @ApiProperty({ example: 5200.0, description: 'Total cost of the fuel' })
  @IsNumber()
  @Min(0)
  cost!: number;

  @ApiProperty({ example: '2026-07-12T00:00:00.000Z' })
  @IsDateString()
  date!: string;
}
