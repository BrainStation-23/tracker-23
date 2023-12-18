import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class InvitedUserRegisterDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class InvitedUserLoginDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
