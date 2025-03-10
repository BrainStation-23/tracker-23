import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SprintViewReqBodyDto {
  @IsOptional()
  projectIds: string[] | string;

  @IsString()
  @IsOptional()
  sprintId?: string;

  @IsString()
  @IsNotEmpty()
  startDate: Date;

  @IsString()
  @IsNotEmpty()
  endDate: Date;

  // @IsBoolean()
  @IsOptional()
  excludeUnworkedTasks?: boolean = false;
}

export class ScrumViewReqBodyDto {
  @IsOptional()
  projectIds: string[];

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  // @IsBoolean()
  @IsOptional()
  excludeUnworkedTasks?: boolean = false;
}

export class NewSprintViewQueryDto {
  @IsString()
  @IsNotEmpty()
  sprintId: string;

  @IsString()
  @IsOptional()
  userIds: string;

  @IsString()
  @IsNotEmpty()
  startDate: Date;

  @IsString()
  @IsNotEmpty()
  endDate: Date;

  @IsOptional()
  // @IsBoolean()
  excludeUnworkedTasks?: boolean = false;
}
