import { IsOptional, IsString } from 'class-validator';

export class SprintReportFilterDto {
  @IsString()
  @IsOptional()
  sprintId: string;
}
