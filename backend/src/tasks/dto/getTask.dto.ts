import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export enum PriorityEnum {
  HIGH = 'HIGH',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
}

export enum StatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  FAILED = 'FAILED',
}
export class GetTaskQuery {
  @IsString()
  @IsOptional()
  startDate: Date;

  @IsString()
  @IsOptional()
  endDate: Date;

  @IsOptional()
  priority: PriorityEnum[];

  @IsOptional()
  status: StatusEnum[];

  @IsString()
  @IsOptional()
  text: string;

  @IsString()
  @IsOptional()
  sprintId: string[];

  @IsString()
  @IsOptional()
  projectIds: string[];
}

export class GetTeamTaskQuery {
  @IsString()
  @IsOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  sprintId?: string;

  @IsArray()
  @IsOptional()
  userIds?: number[];
}
export class ProjectTaskDeto {
  @IsNumber()
  projectId: string;
}
