import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ExpenseType } from '@/generated/prisma/enums';

export class QueryExpenseDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by vehicle ID' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({ enum: ExpenseType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType;
}
