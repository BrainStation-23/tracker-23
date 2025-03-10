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
  UseGuards,
} from '@nestjs/common';
import { Task, User } from '@prisma/client';

import {
  CreateTaskDto,
  EstimationReqBodyDto,
  GetScrumTaskQuery,
  GetTaskQuery,
  StatusReqBodyDto,
  TimeSpentReqBodyDto,
  UpdatePinDto,
} from './dto';
import { TasksService } from './tasks.service';
import { UpdateIssuePriorityReqBodyDto } from './dto/update.issue.req.dto';
import { RabbitMQService } from '../queue/queue.service';
import { QueuePayloadType } from '../queue/types';

@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onApplicationBootstrap() {
    await this.rabbitMQService.connect();
    await Promise.all([
      this.rabbitMQService.consume(QueuePayloadType.SYNC_ALL),
      this.rabbitMQService.consume(QueuePayloadType.RELOAD),
      this.rabbitMQService.consume(QueuePayloadType.SYNC_PROJECT_OR_OUTLOOK),
    ]);
  }

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

  @Get('task-by-week')
  @UseGuards(JwtAuthGuard)
  async getTasksForWeek(
    @GetUser() user: User,
    @Query() query: GetScrumTaskQuery,
  ) {
    return this.tasksService.getTasksByWeek(user, query.projectIds, query.date);
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

  @Delete('sync/delete')
  @UseGuards(JwtAuthGuard)
  async deleteAllSyncCall() {
    await this.tasksService.deleteAllSyncCall();
  }

  @Get('sync/:projectId')
  @UseGuards(JwtAuthGuard)
  async syncSingleProjectOrCalendar(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.syncAndGetTasks(user, Number(projectId));
  }

  // @Get('queue/sync/:projectId')
  // @UseGuards(JwtAuthGuard)
  // async syncAndGetTasks(
  //   @GetUser() user: User,
  //   @Param('projectId') projectId: string,
  //   @Response() res: any,
  // ) {
  //   return this.tasksService.syncSingleProjectOrCalendar(
  //     user,
  //     Number(projectId),
  //     res,
  //   );
  // }

  @Get('syncAll')
  @UseGuards(JwtAuthGuard)
  async syncAll(@GetUser() user: User) {
    return await this.tasksService.syncAll(user);
  }

  @Get('reload')
  @UseGuards(JwtAuthGuard)
  async reload(@GetUser() user: User) {
    return await this.tasksService.reload(user);
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
