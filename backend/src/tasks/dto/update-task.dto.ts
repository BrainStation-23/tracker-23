import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { StatusEnum } from './getTask.dto';

export class UpdateTaskDto extends CreateTaskDto {
  @IsOptional()
  @IsString()
  title: string;
}
export class StatusReqBodyDto {
  @IsNotEmpty()
  status: StatusEnum;
}

export class TimeSpentReqBodyDto {
  @IsString()
  @IsNotEmpty()
  timeSpent: string;
}
