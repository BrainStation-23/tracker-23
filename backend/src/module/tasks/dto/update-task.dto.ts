import { IsBoolean, IsNotEmpty, IsString, Min } from 'class-validator';
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

export class EstimationReqBodyDto {
  @Min(0)
  @IsNotEmpty()
  estimation: number;
}
export class TimeSpentReqBodyDto {
  @IsString()
  @IsNotEmpty()
  timeSpent: string;
}
