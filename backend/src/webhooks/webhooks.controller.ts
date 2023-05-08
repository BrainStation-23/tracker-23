import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard';
import { WebhooksService } from './webhooks.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
@Controller('webhookreceiver')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async handleWebhook(@Body() data: any) {
    return this.webhooksService.handleWebhook(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getWebhooks(@GetUser() user: User) {
    return this.webhooksService.getWebhooks(user);
  }
}
