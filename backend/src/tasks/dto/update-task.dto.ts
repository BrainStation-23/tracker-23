import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { StatusEnum } from './getTask.dto';

export class UpdatePinDto {
  @IsNotEmpty()
  @IsBoolean()
  pinned: boolean;
}
export class StatusReqBodyDto {
  @IsNotEmpty()
  status: StatusEnum;
}

export class TimeSpentReqBodyDto {
  @IsString()
  @IsNotEmpty()
  timeSpent: string;
}
