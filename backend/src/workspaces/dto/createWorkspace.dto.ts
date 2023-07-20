import { IsNotEmpty, IsString } from 'class-validator';

export class WorkspaceReqBody {
  @IsString()
  @IsNotEmpty()
  name: string;
}
