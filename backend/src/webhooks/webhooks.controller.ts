import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard';
import { WebhooksService } from './webhooks.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { RegisterWebhookDto, extendWebhookLifeReqDto } from './dto';
import { deleteWebhookDto } from './dto/deleteWebhook.dto';
@Controller('webhook')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('receiver')
  async handleWebhook(@Body() payload: any) {
    return this.webhooksService.handleWebhook(payload);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerWebhook(
    @GetUser() user: User,
    @Body() reqBody: RegisterWebhookDto,
  ) {
    return this.webhooksService.registerWebhook(user, reqBody);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async deleteWebhook(
    @GetUser() user: User,
    @Body() reqBody: deleteWebhookDto,
  ) {
    return this.webhooksService.deleteWebhook(user, reqBody);
  }

  @Get('failed')
  @UseGuards(JwtAuthGuard)
  async failedWebhook(@GetUser() user: User) {
    return this.webhooksService.failedWebhook(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getWebhooks(@GetUser() user: User) {
    return this.webhooksService.getWebhooks(user);
  }

  @Patch('extend-life')
  @UseGuards(JwtAuthGuard)
  async extendWebhookLife(
    @GetUser() user: User,
    @Body() reqBody: extendWebhookLifeReqDto,
  ) {
    console.log(reqBody);
    return this.webhooksService.extendWebhookLife(user, reqBody);
  }
}
