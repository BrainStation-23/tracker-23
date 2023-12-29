import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectRequest {
  @IsString()
  @IsNotEmpty()
  projectName: string;
}

export class ImportCalendarProjectQueryDto {
  @IsString()
  @IsNotEmpty()
  projectIds: string;
}
