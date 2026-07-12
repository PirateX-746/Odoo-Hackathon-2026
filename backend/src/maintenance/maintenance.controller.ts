import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/generated/prisma/enums';
import { serializeDecimals } from '@/common/utils/decimal.util';

@ApiTags('Maintenance')
@ApiBearerAuth('access-token')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  async create(@Body() dto: CreateMaintenanceDto) {
    const log = await this.maintenanceService.create(dto);
    return serializeDecimals(log);
  }

  @Post(':id/close')
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  async close(@Param('id') id: string) {
    const log = await this.maintenanceService.close(id);
    return serializeDecimals(log);
  }

  @Get()
  async findAll(@Query() query: QueryMaintenanceDto) {
    const result = await this.maintenanceService.findAll(query);
    return {
      ...result,
      data: result.data.map((log) => serializeDecimals(log)),
    };
  }

  @Get('vehicle/:vehicleId')
  async findAllForVehicle(@Param('vehicleId') vehicleId: string) {
    const logs = await this.maintenanceService.findAllForVehicle(vehicleId);
    return logs.map((log) => serializeDecimals(log));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const log = await this.maintenanceService.findOne(id);
    return serializeDecimals(log);
  }
}
