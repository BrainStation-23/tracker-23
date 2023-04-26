import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class SessionDto {
  @Min(1)
  @IsNotEmpty()
  @IsNumber()
  taskId: number;
}

export class ManualTimeEntryReqBody {
  @IsString()
  @IsNotEmpty()
  startTime: Date;

  @IsString()
  @IsNotEmpty()
  endTime: Date;

  @IsString()
  @IsNotEmpty()
  day: string;

  @Min(1)
  @IsNotEmpty()
  @IsNumber()
  taskId: number;
}
