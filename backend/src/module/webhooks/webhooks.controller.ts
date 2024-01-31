import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard';
import { WebhooksService } from './webhooks.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import {
  RegisterOutlookWebhookQueryDto,
  RegisterWebhookDto,
  deleteWebhookDto,
  extendWebhookLifeReqDto,
} from './dto';
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

  @Post('outlook/register')
  @UseGuards(JwtAuthGuard)
  async registerOutlookWebhook(
    @GetUser() user: User,
    @Query() query: RegisterOutlookWebhookQueryDto,
  ) {
    return await this.webhooksService.registerOutlookWebhook(
      user,
      query.calendarId,
    );
  }

  @Post('outlook/receiver')
  async handleOutlookWebhook(
    @Query('validationToken') validationToken: any,
    @Body() payload: any,
  ) {
    return await this.webhooksService.handleOutlookWebhook(
      validationToken,
      payload,
    );
  }

  @Get('outlook/subscriptions')
  @UseGuards(JwtAuthGuard)
  async getOutlookWebhooks(@GetUser() user: User) {
    return this.webhooksService.getOutlookWebhooks(user);
  }

  @Delete('outlook/subscriptions/:webhookId')
  @UseGuards(JwtAuthGuard)
  async deleteOutlookWebhook(
    @GetUser() user: User,
    @Param('webhookId') webhookId: string,
  ) {
    return await this.webhooksService.deleteOutlookWebhook(
      user,
      Number(webhookId),
    );
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
  async failedWebhook(@GetUser() user: User, reqBody: RegisterWebhookDto) {
    return this.webhooksService.failedWebhook(user, reqBody);
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
    return this.webhooksService.extendWebhookLife(user, reqBody);
  }
}
