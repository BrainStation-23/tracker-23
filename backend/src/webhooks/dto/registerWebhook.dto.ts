import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RegisterWebhookDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsArray()
  @IsNotEmpty()
  webhookEvents: string[];

  @IsArray()
  @IsNotEmpty()
  projectName: string[];
}
