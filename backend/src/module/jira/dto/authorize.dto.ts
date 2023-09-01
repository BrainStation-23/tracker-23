import { IsNotEmpty, IsString } from 'class-validator';

export class AuthorizeJiraDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
