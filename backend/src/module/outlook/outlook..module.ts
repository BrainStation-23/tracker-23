import { Module } from '@nestjs/common';
import { OutlookService } from './outlook..service';
import { OutlookController } from './outlook..controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [WorkspacesModule, IntegrationsModule, ProjectsModule],
  controllers: [OutlookController],
  providers: [OutlookService],
})
export class OutlookModule {}
