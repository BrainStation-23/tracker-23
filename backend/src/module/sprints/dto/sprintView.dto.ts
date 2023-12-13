import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SprintViewReqBodyDto {
  @IsString()
  @IsNotEmpty()
  sprintId: string;

  @IsString()
  @IsOptional()
  startDate: Date;

  @IsString()
  @IsOptional()
  endDate: Date;
}
