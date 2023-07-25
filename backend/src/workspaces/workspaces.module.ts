import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [HttpModule.register({})],
  providers: [WorkspacesService],
  controllers: [WorkspacesController],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
