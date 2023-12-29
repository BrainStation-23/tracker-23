import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectRequest {
  @IsNotEmpty()
  @IsString()
  projectName: string;
}
