import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { DriverStatus } from '@/generated/prisma/enums';

export class QueryDriverDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DriverStatus })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against name or licenseNumber',
    example: 'Ravi',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
