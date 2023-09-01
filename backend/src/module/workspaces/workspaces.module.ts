import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';

@Module({
  imports: [HttpModule.register({})],
  providers: [WorkspacesService, WorkspaceDatabase],
  controllers: [WorkspacesController],
  exports: [WorkspacesService, WorkspaceDatabase],
})
export class WorkspacesModule {}
