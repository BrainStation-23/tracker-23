import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { JwtAuthGuard } from 'src/guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { AuthorizeOutlookDto } from './dto/authorization.dto';
import { Request } from 'express';

@Controller('integrations/outlook')
export class OutlookController {
  constructor(private readonly outlookService: OutlookService) {}

  @Get('callback')
  callback(@Req() req: Request) {
    // console.log(
    //   '🚀 ~ file: outlook..controller.ts:13 ~ OutlookController ~ callback ~ req:',
    //   req.query.code,
    // );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async integrationLink() {
    return this.outlookService.getIntegrationLink();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/authorize')
  async createIntegration(
    @GetUser() user: User,
    @Body() dto: AuthorizeOutlookDto,
  ) {
    return this.outlookService.createIntegration(dto, user);
  }
}
