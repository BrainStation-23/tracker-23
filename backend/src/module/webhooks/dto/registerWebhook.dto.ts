import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  userIntegrationId: number;
}

export class FailedWebhookReqBody {
  @IsNumber()
  @IsNotEmpty()
  userIntegrationId: number;
}
