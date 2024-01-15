import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SprintViewReqBodyDto {
  @IsString()
  @IsNotEmpty()
  sprintId: string;

  @IsString()
  @IsNotEmpty()
  startDate: Date;

  @IsString()
  @IsNotEmpty()
  endDate: Date;
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
}
