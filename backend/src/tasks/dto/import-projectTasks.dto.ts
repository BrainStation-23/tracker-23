import { IsNotEmpty, IsNumber } from 'class-validator';

export class importProjectTasks {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
