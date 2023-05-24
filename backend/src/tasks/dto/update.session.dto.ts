import { IsDate, IsNotEmpty } from 'class-validator';

export class SessionReqBodyDto {
  // @IsDate()
  @IsNotEmpty()
  startTime?: Date;

  // @IsDate()
  @IsNotEmpty()
  endTime?: Date;
}
