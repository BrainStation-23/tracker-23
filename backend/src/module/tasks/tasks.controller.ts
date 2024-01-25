import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import { Task, User } from '@prisma/client';

import {
  CreateTaskDto,
  EstimationReqBodyDto,
  GetTaskQuery,
  StatusReqBodyDto,
  TimeSpentReqBodyDto,
  UpdatePinDto,
} from './dto';
import { TasksService } from './tasks.service';
import { UpdateIssuePriorityReqBodyDto } from './dto/update.issue.req.dto';
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  // @UseGuards(new RolesGuard(['USER', 'ADMIN']))
  @UseGuards(JwtAuthGuard)
  async getTasks(
    @GetUser() user: User,
    @Query() query: GetTaskQuery,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(user, query);
  }

  @Get('workspace-tasks')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceTasks(
    @GetUser() user: User,
    @Query() query: GetTaskQuery,
  ): Promise<Task[]> {
    return this.tasksService.getWorkspaceTasks(user, query);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createTask(
    @GetUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.tasksService.createTask(user, createTaskDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePinDto: UpdatePinDto,
  ): Promise<Task> {
    return this.tasksService.updatePin(id, updatePinDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.deleteTask(id);
  }

  @Get('sync/status')
  @UseGuards(JwtAuthGuard)
  async callSync(@GetUser() user: User) {
    return await this.tasksService.getCallSync(user);
  }

  @Get('sync/:projectId')
  @UseGuards(JwtAuthGuard)
  async syncAndGetTasks(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Response() res: any,
  ) {
    return this.tasksService.syncSingleProjectOrCalendar(
      user,
      Number(projectId),
      res,
    );
  }
  @Get('syncAll')
  @UseGuards(JwtAuthGuard)
  async syncAllAndUpdateTasks(@GetUser() user: User) {
    return await this.tasksService.syncAll(user);
  }

  @Patch('update/status/:taskId')
  @UseGuards(JwtAuthGuard)
  async updateIssueStatus(
    @GetUser() user: User,
    @Param('taskId') taskId: string,
    @Body() statusReqBody: StatusReqBodyDto,
  ) {
    return this.tasksService.updateIssueStatus(
      user,
      taskId,
      statusReqBody.status,
    );
  }
  @Patch('update/estimation/:taskId')
  @UseGuards(JwtAuthGuard)
  async updateIssueEstimation(
    @GetUser() user: User,
    @Param('taskId') taskId: string,
    @Body() estimationReqBody: EstimationReqBodyDto,
  ) {
    return this.tasksService.updateIssueEstimation(
      user,
      taskId,
      estimationReqBody.estimation,
    );
  }

  @Patch('manual-timeEntry/:issueId')
  @UseGuards(JwtAuthGuard)
  async addWorkLog(
    @GetUser() user: User,
    @Param('issueId') issueId: string,
    @Body() timeSpentReqBody: TimeSpentReqBodyDto,
  ) {
    return this.tasksService.addWorkLog(user, issueId, timeSpentReqBody);
  }

  @Get('all/status')
  @UseGuards(JwtAuthGuard)
  async getAllStatus(@GetUser() user: User) {
    return this.tasksService.getAllStatus(user);
  }

  @Post('/update/priority/:taskId')
  @UseGuards(JwtAuthGuard)
  async updateTaskPriority(
    @GetUser() user: User,
    @Param('taskId') taskId: string,
    @Body() updateIssuePriorityReqBody: UpdateIssuePriorityReqBodyDto,
  ) {
    return await this.tasksService.updateTaskPriority(
      user,
      +taskId,
      updateIssuePriorityReqBody,
    );
  }
}
