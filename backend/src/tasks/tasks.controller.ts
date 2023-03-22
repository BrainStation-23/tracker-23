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
import { CreateTaskDto, GetTaskQuery } from './dto';
import { TasksService } from './tasks.service';
import { Task, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { UpdateTaskDto } from './dto';

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
  ): Promise<Task> {
    return this.tasksService.createTask(user, createTaskDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.deleteTask(id);
  }

  @Get('sync')
  @UseGuards(JwtAuthGuard)
  async syncAndGetTasks(@GetUser() user: User): Promise<Task[]> {
    // From PARAMS get filters so that we can bring tasks that are reasonable, for now we only bring todo and inprogress and assigned to the user.
    return await this.tasksService.syncTasks(user);
  }
}
