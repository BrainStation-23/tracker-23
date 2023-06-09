import { IsNotEmpty, IsNumber } from 'class-validator';

export class extendWebhookLifeReqDto {
  @IsNumber()
  @IsNotEmpty()
  webhookId: number;
}
