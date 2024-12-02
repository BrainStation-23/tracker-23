import { Module } from '@nestjs/common';
import { ClientService } from './client';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  controllers: [],
  providers: [ClientService],
  exports: [ClientService],
})
export class HelperModule {}
