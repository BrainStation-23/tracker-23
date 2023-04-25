import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
export type userDto = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  id: number;
  picture: string | null;
};
