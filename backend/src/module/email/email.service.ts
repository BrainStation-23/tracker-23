import { Injectable } from '@nestjs/common';
import { Client } from 'node-mailjet';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class EmailService {
  private mailjet: Client;

  constructor(private config: ConfigService) {
    this.mailjet = new Client({
      apiKey: this.config.get('MJ_APIKEY_PUBLIC'),
      apiSecret: this.config.get('MJ_APIKEY_PRIVATE'),
    });
  }

  async sendEmail(subject: string, body: string, to: string) {
    const request = this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.config.get('GOOGLE_EMAIL_USER'),
            Name: 'Tracker-23',
          },
          To: [
            {
              Email: to,
              // Name: 'Recipient Name',
            },
          ],
          Subject: subject,
          TextPart: body,
          HTMLPart: body,
        },
      ],
    });
    try {
      const result = await request;
      return result.body;
    } catch (err) {
      console.error(err.statusCode, err.message, err); // Error handling
      throw new Error('Failed to send email');
    }
  }
}
