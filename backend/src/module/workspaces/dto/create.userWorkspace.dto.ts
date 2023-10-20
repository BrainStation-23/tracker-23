import {IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import { Role, UserWorkspaceStatus } from '@prisma/client';

export class CreateUserWorkspaceData {
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsNotEmpty()
  @IsEnum(UserWorkspaceStatus)
  status: UserWorkspaceStatus;

  @IsNotEmpty()
  @IsString()
  invitationId: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  workspaceId: number;

  @IsNotEmpty()
  @IsNumber()
  inviterUserId: number;

  @IsOptional()
  @IsDate()
  invitedAt: Date;
}
