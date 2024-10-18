import { UserWorkspaceStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
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
  INVALID_JIRA_REFRESH_TOKEN = 'INVALID_JIRA_REFRESH_TOKEN',
  INVALID_OUTLOOK_REFRESH_TOKEN = 'INVALID_OUTLOOK_REFRESH_TOKEN',
}

export class GetScrumTaskQuery {
  @IsOptional()
  @IsString()
  date: Date | string;

  @IsString()
  @IsOptional()
  projectIds: string[];
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

  @IsString()
  @IsOptional()
  userIds: string;

  @IsString()
  @IsOptional()
  types: string;
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

export class GetTimeSheetQueryDto {
  @IsString()
  @IsOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  userIds?: string;

  @IsString()
  @IsOptional()
  projectIds?: string;

  @IsString()
  @IsOptional()
  types: string;
}

export class ProjectTaskDto {
  @IsNumber()
  projectId: string;
}

export enum GetTeamTaskQueryType {
  DATE_RANGE = 'DATE_RANGE',
  PER_DAY = 'PER_DAY',
}
