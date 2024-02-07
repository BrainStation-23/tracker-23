import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class extendWebhookLifeReqDto {
  @IsString()
  @IsNotEmpty()
  webhookId: string;

  @IsNumber()
  @IsNotEmpty()
  userIntegrationId: number;
}
