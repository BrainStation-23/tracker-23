import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterOutlookWebhookQueryDto {
  @IsString()
  @IsNotEmpty()
  calendarId: string;
}
