import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PageDatabase } from 'src/database/pages';
import { WorkspaceDatabase } from 'src/database/workspaces';

@Module({
  controllers: [PagesController],
  providers: [PagesService, PageDatabase, WorkspaceDatabase],
  exports: [PageDatabase, PagesService],
})
export class PagesModule {}
