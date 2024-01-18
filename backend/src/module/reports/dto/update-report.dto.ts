import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateReportDto {
  @IsString()
  @IsOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  projectIds?: number[];

  @IsArray()
  @IsOptional()
  calendarIds?: number[];

  @IsArray()
  @IsOptional()
  userIds?: number[];

  @IsArray()
  @IsOptional()
  sprintIds?: number[];

  @IsArray()
  @IsOptional()
  types?: string[];
}
