import { UserWorkspaceStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PriorityEnum {
  HIGHEST = 'HIGHEST',
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

export class ExportTeamTaskDataQuery {
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

  @IsString()
  @IsOptional()
  userIds: string[];
}

export class GetTeamTaskQuery {
  @IsString()
  @IsOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  endDate?: Date;

  @IsEnum(UserWorkspaceStatus)
  @IsOptional()
  status?: UserWorkspaceStatus;

  @IsString()
  @IsOptional()
  userIds?: string;

  @IsString()
  @IsOptional()
  projectIds?: string;
}

export class GetTimesheetQuery {
  @IsString()
  @IsOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  userIds?: string;
}

export class ProjectTaskDeto {
  @IsNumber()
  projectId: string;
}

export enum GetTeamTaskQueryType {
  DATE_RANGE = 'DATE_RANGE',
  PER_DAY = 'PER_DAY',
}
