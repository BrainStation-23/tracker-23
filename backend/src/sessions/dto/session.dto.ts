import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SessionDto {
  @Min(1)
  @IsNotEmpty()
  @IsNumber()
  taskId: number;
}
