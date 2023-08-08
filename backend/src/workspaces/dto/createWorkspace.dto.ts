import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WorkspaceReqBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  changeWorkspace?: boolean;

  @IsString()
  @IsOptional()
  icon?: string;
}
