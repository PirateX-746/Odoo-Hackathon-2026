import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DispatchAssistantService } from './dispatch-assistant.service';
import { RecommendDispatchDto } from './dto/recommend-dispatch.dto';
import { DispatchRecommendationsDto } from './dto/dispatch-recommendation.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/generated/prisma/enums';

@ApiTags('Dispatch Assistant')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN, Role.FLEET_MANAGER)
// Two path segments so this can never structurally collide with
// TripsController's `GET /trips/:id` route, regardless of module
// registration order (a single-segment path like `trips/dispatch-recs`
// would be swallowed by `:id` if TripsModule registers first).
@Controller('trips/dispatch/recommendations')
export class DispatchAssistantController {
  constructor(
    private readonly dispatchAssistantService: DispatchAssistantService,
  ) {}

  @Get()
  @ApiOkResponse({ type: DispatchRecommendationsDto })
  getRecommendations(
    @Query() query: RecommendDispatchDto,
  ): Promise<DispatchRecommendationsDto> {
    return this.dispatchAssistantService.recommend(query);
  }
}
