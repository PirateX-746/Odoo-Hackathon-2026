import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DriverStatus } from '@/generated/prisma/enums';

export class CreateDriverDto {
  @ApiProperty({ example: 'Ravi Kumar' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'DL-1420110012345' })
  @IsString()
  licenseNumber!: string;

  @ApiProperty({ example: 'LMV' })
  @IsString()
  licenseCategory!: string;

  @ApiProperty({ example: '2027-06-30' })
  @IsDateString()
  licenseExpiryDate!: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  contactNumber!: string;

  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  safetyScore?: number;

  @ApiPropertyOptional({ enum: DriverStatus, default: DriverStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
