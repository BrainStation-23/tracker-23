import { IsOptional, IsString } from 'class-validator';
import { PriorityEnum, StatusEnum } from 'src/tasks/dto';

export class GetSprintListQueryDto {
  @IsOptional()
  priority: PriorityEnum[];

  @IsOptional()
  status: StatusEnum[];

  @IsString()
  @IsOptional()
  text: string;

  @IsString()
  @IsOptional()
  state?: StateEnum[];
}

export const enum StateEnum {
  CLOSE = 'closed',
  ACTIVE = 'active',
  FUTURE = 'future',
}
