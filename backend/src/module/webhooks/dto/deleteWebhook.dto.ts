import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class deleteWebhookDto {
  @IsString()
  @IsNotEmpty()
  webhookId: string;

  @IsNumber()
  @IsNotEmpty()
  userIntegrationId: number;
}
