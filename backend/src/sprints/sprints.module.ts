import { IntegrationsModule } from 'src/integrations/integrations.module';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { SprintsController } from 'src/sprints/sprints.controller';
import { SprintsService } from 'src/sprints/sprints.service';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  providers: [SprintsService, IntegrationsService],
  controllers: [SprintsController],
  exports: [SprintsService],
})
export class SprintsModule {}
