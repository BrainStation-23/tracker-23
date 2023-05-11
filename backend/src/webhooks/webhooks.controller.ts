import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard';
import { WebhooksService } from './webhooks.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
@Controller('webhook')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('receiver')
  async handleWebhook(@Body() payload: any) {
    return this.webhooksService.handleWebhook(payload);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerWebhook(@GetUser() user: User, @Body() reqBody: any) {
    return this.webhooksService.registerWebhook(user, reqBody);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getWebhooks(@GetUser() user: User) {
    return this.webhooksService.getWebhooks(user);
  }
}
