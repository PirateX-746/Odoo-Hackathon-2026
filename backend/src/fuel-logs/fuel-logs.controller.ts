import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FuelLogsService } from './fuel-logs.service';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { UpdateFuelLogDto } from './dto/update-fuel-log.dto';
import { QueryFuelLogDto } from './dto/query-fuel-log.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/generated/prisma/enums';

@ApiTags('Fuel Logs')
@ApiBearerAuth('access-token')
@Controller('fuel-logs')
export class FuelLogsController {
  constructor(private readonly fuelLogsService: FuelLogsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  create(@Body() dto: CreateFuelLogDto) {
    return this.fuelLogsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryFuelLogDto) {
    return this.fuelLogsService.findAll(query);
  }

  @Get('vehicle/:vehicleId')
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.fuelLogsService.findByVehicle(vehicleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fuelLogsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateFuelLogDto) {
    return this.fuelLogsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.fuelLogsService.remove(id);
  }
}
