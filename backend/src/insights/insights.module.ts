import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { AiModule } from '@/ai/ai.module';
import { DashboardModule } from '@/dashboard/dashboard.module';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  imports: [AiModule, DashboardModule, ReportsModule],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
