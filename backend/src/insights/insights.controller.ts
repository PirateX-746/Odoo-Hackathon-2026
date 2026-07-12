import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { InsightsSummaryDto } from './dto/insights-summary.dto';
import { ReportQueryDto } from '@/reports/dto/report-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/generated/prisma/enums';

@ApiTags('Insights')
@ApiBearerAuth('access-token')
@Roles(
  Role.ADMIN,
  Role.FLEET_MANAGER,
  Role.SAFETY_OFFICER,
  Role.FINANCIAL_ANALYST,
)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('summary')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOkResponse({ type: InsightsSummaryDto })
  getSummary(@Query() query: ReportQueryDto): Promise<InsightsSummaryDto> {
    return this.insightsService.generateSummary(query);
  }
}
