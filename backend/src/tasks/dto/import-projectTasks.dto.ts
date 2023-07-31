import { IsNotEmpty, IsString } from 'class-validator';

export class importProjectTasks {
  @IsString()
  @IsNotEmpty()
  projectId: string;
}
