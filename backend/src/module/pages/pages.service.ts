import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { PageDatabase } from 'src/database/pages';
import { Page, User } from '@prisma/client';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { APIException } from '../exception/api.exception';

@Injectable()
export class PagesService {
  constructor(
    private pageDatabase: PageDatabase,
    private workspacesService: WorkspacesService,
  ) {}
  async createPage(user: User, createPageDto: CreatePageDto) {
    const doesExistPage = await this.pageDatabase.findPage(createPageDto.name);
    if (doesExistPage) {
      throw new APIException('Page already exists', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    const page = {
      userWorkspaceId: userWorkspace.id,
      workspaceId: user.activeWorkspaceId,
      name: createPageDto.name,
    };
    const createdPage = await this.pageDatabase.createPage(page);
    if (!createdPage) {
      throw new APIException(
        'Failed to create page',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return createdPage;
  }

  async getPages(user: User): Promise<any[] | []> {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.pageDatabase.getPages({
      workspaceId: user.activeWorkspaceId,
      userWorkspaceId: userWorkspace.id,
    });
  }

  async updatePage(id: number, name: string): Promise<Page> {
    const updatedPage = await this.pageDatabase.updatePage(id, name);
    if (!updatedPage) {
      throw new APIException(
        'Failed to update page name!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return updatedPage;
  }

  async removePage(id: number): Promise<Page> {
    const deletedPage = await this.pageDatabase.removePage(id);
    if (!deletedPage) {
      throw new APIException(
        'Failed to delete page by Id',
        HttpStatus.BAD_REQUEST,
      );
    }
    return deletedPage;
  }
}
