import { IsOptional, IsString } from 'class-validator';

export class GetSprintListQueryDto {
  @IsString()
  @IsOptional()
  state?: StateEnum[];
}

export const enum StateEnum {
  CLOSE = 'closed',
  ACTIVE = 'active',
  FUTURE = 'future',
}
