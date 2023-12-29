import { IsNotEmpty, IsString } from 'class-validator';

export class AuthorizeOutlookDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
