import { IsOptional, IsString } from 'class-validator';

export class UserListByProjectIdReqDto {
  @IsString()
  @IsOptional()
  projectIds: string;
}
