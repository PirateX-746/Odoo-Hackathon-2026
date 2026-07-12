import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { CompleteTripDto } from './dto/complete-trip.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Role } from '@/generated/prisma/enums';
import type { AuthenticatedUser } from '@/common/interfaces/jwt-payload.interface';

@ApiTags('Trips')
@ApiBearerAuth('access-token')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  create(@Body() dto: CreateTripDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tripsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: QueryTripDto) {
    return this.tripsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Post(':id/dispatch')
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  dispatch(@Param('id') id: string) {
    return this.tripsService.dispatch(id);
  }

  @Post(':id/complete')
  @Roles(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER)
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteTripDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tripsService.complete(id, dto, user);
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.FLEET_MANAGER)
  cancel(@Param('id') id: string) {
    return this.tripsService.cancel(id);
  }
}
