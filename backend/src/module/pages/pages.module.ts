import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { PageDatabase } from 'src/database/pages';

@Module({
  imports: [WorkspacesModule],
  controllers: [PagesController],
  providers: [PagesService, PageDatabase],
  exports: [PageDatabase],
})
export class PagesModule {}
