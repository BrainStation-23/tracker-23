import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body('subject') subject: string,
    @Body('body') body: string,
    @Body('to') to: string,
    @Body() dt: any,
  ) {
    console.log(dt);
    const success: any = await this.emailService.sendEmail(subject, body, to);
    if (success) {
      return { message: 'Email sent successfully' };
    } else {
      return { message: 'Failed to send email' };
    }
  }
}
