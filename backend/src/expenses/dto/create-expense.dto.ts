import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ExpenseType } from '@/generated/prisma/enums';

export class CreateExpenseDto {
  @ApiProperty({ description: 'ID of the vehicle this expense applies to' })
  @IsUUID()
  vehicleId!: string;

  @ApiProperty({ enum: ExpenseType })
  @IsEnum(ExpenseType)
  type!: ExpenseType;

  @ApiProperty({ example: 1500.0, description: 'Expense amount' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-07-12T00:00:00.000Z' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ example: 'Toll charge on NH48' })
  @IsOptional()
  @IsString()
  description?: string;
}
