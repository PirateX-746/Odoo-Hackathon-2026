import { ApiProperty } from '@nestjs/swagger';

export class DispatchRecommendationItemDto {
  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  rationale!: string;

  @ApiProperty()
  confidenceScore!: number;
}

export class DispatchRecommendationsDto {
  @ApiProperty({ type: [DispatchRecommendationItemDto] })
  recommendations!: DispatchRecommendationItemDto[];
}
