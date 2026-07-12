import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardKpisDto } from './dto/dashboard-kpis.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/generated/prisma/enums';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Roles(
  Role.ADMIN,
  Role.FLEET_MANAGER,
  Role.SAFETY_OFFICER,
  Role.FINANCIAL_ANALYST,
)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15_000)
  @ApiOkResponse({ type: DashboardKpisDto })
  getKpis(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getKpis(query);
  }
}
