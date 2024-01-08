import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateReportDto {
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  projectIds?: string;

  @IsString()
  @IsOptional()
  userIds?: string;

  @IsString()
  @IsOptional()
  sprintIds?: string;

  @IsString()
  @IsOptional()
  types?: string;
}
