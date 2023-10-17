import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsOptional()
  remember: boolean;
}
export type userDto = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  id: number;
  picture: string | null;
};

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  email: string;
}

export class PasswordResetDto {
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
