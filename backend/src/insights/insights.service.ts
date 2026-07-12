import { Injectable } from '@nestjs/common';
import { AnthropicService } from '@/ai/anthropic.service';
import { DashboardService } from '@/dashboard/dashboard.service';
import { ReportsService } from '@/reports/reports.service';
import { ReportQueryDto } from '@/reports/dto/report-query.dto';
import { InsightsSummaryDto } from './dto/insights-summary.dto';

const INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    highlights: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
  },
  required: ['headline', 'highlights', 'risks', 'recommendations'],
  additionalProperties: false,
};

interface RawInsights {
  headline: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
}

@Injectable()
export class InsightsService {
  constructor(
    private readonly anthropic: AnthropicService,
    private readonly dashboardService: DashboardService,
    private readonly reportsService: ReportsService,
  ) {}

  async generateSummary(filters: ReportQueryDto): Promise<InsightsSummaryDto> {
    const [kpis, vehicleReports] = await Promise.all([
      this.dashboardService.getKpis(filters),
      this.reportsService.getVehicleReports(filters),
    ]);

    const raw = await this.anthropic.createStructuredCompletion<RawInsights>({
      system:
        'You are a fleet operations analyst for TransitOps, a transport management platform. ' +
        'Given current fleet KPIs and per-vehicle financial/operational data as JSON, write a ' +
        'concise executive summary for a fleet manager. Be specific — reference vehicle names ' +
        'and numbers from the data rather than speaking in generalities. Do not invent data not ' +
        'present in the input.',
      userContent: JSON.stringify({ kpis, vehicleReports }),
      schema: INSIGHTS_SCHEMA,
      effort: 'low',
      maxTokens: 1024,
    });

    return { ...raw, generatedAt: new Date().toISOString() };
  }
}
