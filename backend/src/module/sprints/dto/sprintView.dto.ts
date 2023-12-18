import { IsNotEmpty, IsString } from 'class-validator';

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
