import { ApiProperty } from '@nestjs/swagger';

export class InsightsSummaryDto {
  @ApiProperty({
    description: 'One-sentence headline capturing the overall fleet state',
  })
  headline!: string;

  @ApiProperty({
    type: [String],
    description: 'Notable positive or neutral observations',
  })
  highlights!: string[];

  @ApiProperty({
    type: [String],
    description: 'Notable risks or issues that need attention',
  })
  risks!: string[];

  @ApiProperty({ type: [String], description: 'Suggested next actions' })
  recommendations!: string[];

  @ApiProperty()
  generatedAt!: string;
}
