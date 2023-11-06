// import { Injectable } from '@nestjs/common';
// import { google } from 'googleapis';
// import * as nodemailer from 'nodemailer';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class EmailService {
//   constructor(private config: ConfigService) {}

//   async sendEmail(subject: string, body: string, to: string) {
//     // console.log(subject, body, to);
//     try {
//       const OAuth2 = google.auth.OAuth2;
//       // interface OAuth2TransportConfig extends nodemailer.TransportOptions {
//       //   auth: {
//       //     type: 'OAuth2';
//       //     user: string; // Your Gmail address
//       //     clientId: string; // Your Google OAuth2 client ID
//       //     clientSecret: string; // Your Google OAuth2 client secret
//       //     accessToken: string; // Obtained access token
//       //   };
//       // }

//       const oauth2Client = new OAuth2(
//         this.config.get('GOOGLE_EMAIL_CLIENT_ID'),
//         this.config.get('GOOGLE_EMAIL_CLIENT_SECRET'),
//         'https://developers.google.com/oauthplayground', // Redirect URL
//       );

//       oauth2Client.setCredentials({
//         refresh_token: this.config.get('GOOGLE_EMAIL_CLIENT_REFRESH_TOKEN'),
//       });

//       const accessToken: string = await new Promise((resolve, reject) => {
//         oauth2Client.getAccessToken((err, token: any) => {
//           if (err) {
//             console.log(
//               '🚀 ~ file: email.service.ts:46 ~ EmailService ~ oauth2Client.getAccessToken ~ err:',
//               err,
//             );
//             reject('Failed to create access token');
//           }
//           resolve(token);
//         });
//       });

//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           type: 'OAuth2',
//           user: this.config.get('GOOGLE_EMAIL_USER'),
//           accessToken: accessToken as string,
//           clientId: this.config.get('GOOGLE_EMAIL_CLIENT_ID'),
//           clientSecret: this.config.get('GOOGLE_CLIENT_SECRET'),
//           refreshToken: this.config.get('GOOGLE_EMAIL_CLIENT_REFRESH_TOKEN'),
//         },
//       });

//       const mailOptions = {
//         //transporterName: 'gmail',
//         from: this.config.get('GOOGLE_EMAIL_USER'),
//         to: to,
//         subject: subject,
//         text: body,
//       };

//       await transporter.sendMail(mailOptions);
//       return true;
//     } catch (error) {
//       console.log(error);
//       return false;
//     }
//   }
// }

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
            Email: 'dipubala466@gmail.com',
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
