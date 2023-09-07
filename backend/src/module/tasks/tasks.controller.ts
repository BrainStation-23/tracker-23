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
  GetTeamTaskQuery,
  StatusReqBodyDto,
  TimeSpentReqBodyDto,
  UpdatePinDto,
  GetTeamTaskQueryType,
} from './dto';
import { TasksService } from './tasks.service';
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

  @Get('sync/:projectId')
  @UseGuards(JwtAuthGuard)
  async syncAndGetTasks(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Response() res: any,
  ) {
    // From PARAMS get filters so that we can bring tasks that are reasonable, for now we only bring todo and inprogress and assigned to the user.
    return await this.tasksService.syncTasks(user, Number(projectId), res);
  }
  @Get('syncAll')
  @UseGuards(JwtAuthGuard)
  async syncAllAndUpdateTasks(@GetUser() user: User) {
    return await this.tasksService.syncAll(user);
  }

  @Get('sync/status')
  @UseGuards(JwtAuthGuard)
  async callSync(@GetUser() user: User) {
    return await this.tasksService.getCallSync(user);
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

  @Get('spent-time/time-range')
  @UseGuards(JwtAuthGuard)
  async weeklySpentTime(@GetUser() user: User, @Query() query: GetTaskQuery) {
    return this.tasksService.weeklySpentTime(user, query);
  }

  @Get('spent-time/per-day')
  @UseGuards(JwtAuthGuard)
  async getSpentTimeByDay(@GetUser() user: User, @Query() query: GetTaskQuery) {
    return this.tasksService.getSpentTimeByDay(user, query);
  }

  //TODO: only for superior role, example: Project Manager, Admin
  @Get('/team/spent-time')
  @UseGuards(JwtAuthGuard)
  async getTimeSpentByTeam(
    @GetUser() user: User,
    @Query() query: GetTeamTaskQuery,
  ) {
    return await this.tasksService.getTimeSpentByTeam(
      query,
      user,
      GetTeamTaskQueryType.DATE_RANGE,
    );
  }

  @Get('/team/spent-time/per-day')
  @UseGuards(JwtAuthGuard)
  async getDailyTimeSpentByTeam(
    @GetUser() user: User,
    @Query() query: GetTeamTaskQuery,
  ) {
    return await this.tasksService.getTimeSpentByTeam(
      query,
      user,
      GetTeamTaskQueryType.PER_DAY,
    );
  }

  @Get('all/status')
  @UseGuards(JwtAuthGuard)
  async getAllStatus(@GetUser() user: User) {
    return this.tasksService.getAllStatus(user);
  }
}
