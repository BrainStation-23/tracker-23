import { IsOptional, IsString } from 'class-validator';

export enum PriorityEnum {
  HIGH = 'HIGH',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
}

export enum StatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
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
}
