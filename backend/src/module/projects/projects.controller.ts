import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Response,
  Patch,
  Body,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';
import { UpdateProjectRequest } from './dto/update.project.dto';
import { CreateProjectRequest } from './dto/create.project.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async getProjectList(@GetUser() user: User) {
    return await this.projectsService.getProjectList(user);
  }

  @Get('/:id')
  async importProjects(
    @GetUser() user: User,
    @Param('id') id: string,
    @Response() res: any,
  ) {
    return this.projectsService.importProjects(user, +id, res);
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
