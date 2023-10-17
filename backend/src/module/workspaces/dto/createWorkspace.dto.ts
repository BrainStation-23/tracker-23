import { Role, UserWorkspaceStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

export class ReqStatusBody {
  @IsString()
  @IsNotEmpty()
  status: UserWorkspaceStatus;
}

export class userWorkspaceType {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  workspaceId: number;

  @IsString()
  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsEnum(UserWorkspaceStatus)
  status: UserWorkspaceStatus;

  @IsNumber()
  @IsOptional()
  inviterUserId?: number;

  @IsString()
  @IsOptional()
  invitationId?: string;

  @IsDate()
  @IsOptional()
  invitedAt?: Date;

  @IsOptional()
  prisma?: any;
}
