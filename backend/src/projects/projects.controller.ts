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
import { ProjectsService } from "./projects.service";
import { User } from "@prisma/client";
import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from "src/guard";
import { importProjectTasks } from "src/tasks/dto";
import { UpdateProjectRequest } from './dto/update.project.dto';
import { CreateProjectRequest } from './dto/create.project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get('/:projectId')
  @UseGuards(JwtAuthGuard)
  async importProjects(
    @GetUser() user: User,
    @Param() param: importProjectTasks,
    @Response() res: any,
  ) {
    return this.projectsService.importProjects(
      user,
      Number(param.projectId),
      res,
    );
  }

  @Post('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProject(
    @GetUser() user: User,
    @Param('id') id: string,
    @Response() res: any,
  ) {
    return this.projectsService.deleteProject(user, Number(id), res);
  }

  @Get('/list')
  @UseGuards(JwtAuthGuard)
  async getProjectList(@GetUser() user: User) {
    return this.projectsService.getProjectList(user);
  }

  @Post('/create')
  async createProject(
    @GetUser() user: User,
    @Body() data: CreateProjectRequest,
  ) {
    return await this.projectsService.createProject(user, data?.projectName);
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