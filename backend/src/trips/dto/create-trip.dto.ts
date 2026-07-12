import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'Pune' })
  @IsString()
  source!: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  destination!: string;

  @ApiProperty({
    description:
      'Must currently be in the dispatch-eligible pool (status AVAILABLE)',
  })
  @IsUUID()
  vehicleId!: string;

  @ApiProperty({
    description:
      'Must currently be in the dispatch-eligible pool (status AVAILABLE, license not expired)',
  })
  @IsUUID()
  driverId!: string;

  @ApiProperty({ example: 450 })
  @IsNumber()
  @Min(0.01)
  cargoWeightKg!: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0.01)
  plannedDistanceKm!: number;
}
