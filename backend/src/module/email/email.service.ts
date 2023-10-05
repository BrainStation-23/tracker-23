import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private config: ConfigService) {}

  async sendEmail(subject: string, body: string, to: string) {
    // console.log(subject, body, to);
    try {
      const OAuth2 = google.auth.OAuth2;
      interface OAuth2TransportConfig extends nodemailer.TransportOptions {
        auth: {
          type: 'OAuth2';
          user: string; // Your Gmail address
          clientId: string; // Your Google OAuth2 client ID
          clientSecret: string; // Your Google OAuth2 client secret
          accessToken: string; // Obtained access token
        };
      }
      const oauth2Client = new OAuth2(
        this.config.get('GOOGLE_EMAIL_CLIENT_ID'),
        this.config.get('GOOGLE_EMAIL_CLIENT_SECRET'),
        'https://developers.google.com/oauthplayground', // Redirect URL
      );

      oauth2Client.setCredentials({
        refresh_token: this.config.get('GOOGLE_EMAIL_CLIENT_REFRESH_TOKEN'),
      });

      const accessToken: string = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token: any) => {
          if (err) {
            console.log(
              '🚀 ~ file: email.service.ts:46 ~ EmailService ~ oauth2Client.getAccessToken ~ err:',
              err,
            );
            reject('Failed to create access token');
          }
          resolve(token);
        });
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.config.get('GOOGLE_EMAIL_USER'),
          clientId: this.config.get('GOOGLE_EMAIL_CLIENT_ID'),
          clientSecret: this.config.get('GOOGLE_CLIENT_SECRET'),
          refreshToken: this.config.get('GOOGLE_EMAIL_CLIENT_REFRESH_TOKEN'),
          accessToken: accessToken as string,
        },
      } as OAuth2TransportConfig);

      const mailOptions = {
        transporterName: 'gmail',
        from: this.config.get('GOOGLE_EMAIL_USER'),
        to: to,
        subject: subject,
        text: body,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
