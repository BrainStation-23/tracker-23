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
import {
  CreateTaskDto,
  EstimationReqBodyDto,
  GetTaskQuery,
  StatusReqBodyDto,
  TimeSpentReqBodyDto,
  UpdatePinDto,
} from './dto';
import { TasksService } from './tasks.service';
import { Task, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/guard';
import { GetUser } from 'src/decorator';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTasks(
    @GetUser() user: User,
    @Query() query: GetTaskQuery,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(user, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTask(
    @GetUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task | undefined> {
    return this.tasksService.createTask(user, createTaskDto);
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

  @Get('sync')
  @UseGuards(JwtAuthGuard)
  async syncAndGetTasks(@GetUser() user: User, @Response() res: any) {
    // From PARAMS get filters so that we can bring tasks that are reasonable, for now we only bring todo and inprogress and assigned to the user.
    return await this.tasksService.syncTasks(user, res);
  }

  @Get('sync/status')
  @UseGuards(JwtAuthGuard)
  async callSync(@GetUser() user: User) {
    return await this.tasksService.getCallSync(user.id);
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

  @Patch('add-work-log/:issueId')
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

  @Get('all/status')
  @UseGuards(JwtAuthGuard)
  async getAllStatus(@GetUser() user: User) {
    return this.tasksService.getAllStatus(user);
  }

  @Get('project-tasks/:projectId')
  @UseGuards(JwtAuthGuard)
  async projectTasks(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Response() res: any,
  ) {
    return this.tasksService.projectTasks(user, Number(projectId), res);
  }

  @Get('project-list')
  @UseGuards(JwtAuthGuard)
  async getProjectList(@GetUser() user: User) {
    return this.tasksService.getProjectList(user);
  }
}
