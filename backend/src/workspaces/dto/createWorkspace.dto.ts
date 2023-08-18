import { Role } from '@prisma/client';
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

export class SendInvitationReqBody {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: Role;
}
