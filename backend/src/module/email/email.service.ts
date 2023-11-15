import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Client } from 'node-mailjet';
import { nodemailerConfig } from 'config/core';
import { MailOptions } from 'nodemailer/lib/json-transport';
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
    // console.log(subject, body, to);
    try {
      const mailOptions = {
        //transporterName: 'gmail',
        from: this.config.get('GOOGLE_EMAIL_USER'),
        to: to,
        subject: subject,
        html: body,
      };

      const transporter: nodemailer.Transporter = nodemailer.createTransport(
        nodemailerConfig.options as MailOptions,
      );
      const res = await transporter.sendMail(mailOptions);
      if (!res) return false;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async sendEmailWithMailjet(subject: string, body: string, to: string) {
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
