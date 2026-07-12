import { Module } from '@nestjs/common';
import { DispatchAssistantController } from './dispatch-assistant.controller';
import { DispatchAssistantService } from './dispatch-assistant.service';
import { AiModule } from '@/ai/ai.module';
import { VehiclesModule } from '@/vehicles/vehicles.module';
import { DriversModule } from '@/drivers/drivers.module';

@Module({
  imports: [AiModule, VehiclesModule, DriversModule],
  controllers: [DispatchAssistantController],
  providers: [DispatchAssistantService],
})
export class DispatchAssistantModule {}
