import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
export class UpdateReportDto {
  @IsString()
  @IsOptional()
  startDate?: Date;

  @IsString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  filterDateType?: FilterDateType;

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

  @IsBoolean()
  @IsOptional()
  excludeUnworkedTasks?: boolean;
}

export enum FilterDateType {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  TOMORROW = 'TOMORROW',
  THIS_WEEK = 'THIS_WEEK',
  PAST_WEEK = 'PAST_WEEK',
  NEXT_WEEK = 'NEXT_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  PAST_MONTH = 'PAST_MONTH',
  NEXT_MONTH = 'NEXT_MONTH',
  CUSTOM_DATE = 'CUSTOM_DATE',
}
