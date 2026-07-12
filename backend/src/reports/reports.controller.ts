import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { VehicleReportDto } from './dto/vehicle-report.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/generated/prisma/enums';
import { toCsv } from '@/common/utils/csv.util';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Roles(
  Role.ADMIN,
  Role.FLEET_MANAGER,
  Role.SAFETY_OFFICER,
  Role.FINANCIAL_ANALYST,
)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('vehicles')
  @ApiOkResponse({ type: [VehicleReportDto] })
  getVehicleReports(@Query() query: ReportQueryDto) {
    return this.reportsService.getVehicleReports(query);
  }

  @Get('vehicles/csv')
  async exportVehicleReportsCsv(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getVehicleReports(query);
    const csv = toCsv(data as unknown as Record<string, unknown>[]);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="vehicle-reports.csv"',
    });
    res.send(csv);
  }

  @Get('fleet-utilization')
  getFleetUtilization(@Query() query: ReportQueryDto) {
    return this.reportsService.getFleetUtilization(query);
  }
}
