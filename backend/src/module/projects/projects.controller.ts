import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import {
  CreateProjectRequest,
  ImportCalendarProjectQueryDto,
  UpdateProjectRequest,
} from './dto';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async getProjectList(@GetUser() user: User) {
    return await this.projectsService.getProjectList(user);
  }

  @Get('report-page')
  async getProjectsByRole(@GetUser() user: User) {
    return await this.projectsService.getProjectsByRole(user);
  }

  @Get('outlook')
  async importCalendarProject(
    @GetUser() user: User,
    @Query() query: ImportCalendarProjectQueryDto,
    @Response() res: any,
  ) {
    return this.projectsService.importCalendarProject(user, query, res);
  }

  @Get('/sync')
  async fetchAllProjects(@GetUser() user: User) {
    return this.projectsService.fetchAllProjects(user);
  }

  @Get('/:id')
  async importProject(
    @GetUser() user: User,
    @Param('id') id: string,
    @Response() res: any,
  ) {
    return this.projectsService.importProject(user, +id, res);
  }

  @Post('/create')
  async createProject(
    @GetUser() user: User,
    @Body() data: CreateProjectRequest,
  ) {
    return await this.projectsService.createProject(user, data?.projectName);
  }

  @Post('/:id')
  async deleteProject(
    @GetUser() user: User,
    @Param('id') id: string,
    @Response() res: any,
  ) {
    return this.projectsService.deleteProject(user, Number(id), res);
  }

  @Patch('/:id')
  async updateProject(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() data: UpdateProjectRequest,
  ) {
    return await this.projectsService.updateProject(user, +id, data);
  }
}
