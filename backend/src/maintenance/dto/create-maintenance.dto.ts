import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'b3f1c2a4-1234-4a5b-8c9d-abcdef123456' })
  @IsUUID()
  vehicleId!: string;

  @ApiProperty({ example: 'Oil change' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({ example: 'Routine oil and filter change' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 120.5 })
  @IsNumber()
  @Min(0)
  cost!: number;
}
