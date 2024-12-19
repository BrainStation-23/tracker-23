import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';
import { AuthorizeJiraDto } from './dto';
import { AzureDevService } from './azure_dev.service';
import { Request } from 'express';

@Controller('integrations/azure-devops')
export class AzureDevController {
  constructor(private readonly azureDevService: AzureDevService) {}

  @Get('callback')
  callback(@Req() req: Request) {
    console.log(
      '🚀 ~ file: jira.controller.ts:23 ~ AzureDevController ~ callback ~ req:',
      req,
    );
    //console.log(req.headers);
    //console.log(req.query);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async integrationLink() {
    return this.azureDevService.getIntegrationLink(undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Post('authorization')
  async findIntegration(@GetUser() user: User, @Body() dto: AuthorizeJiraDto) {
    console.log('🚀 ~ AzureDevController ~ findIntegration ~ dto:', dto);
    return this.azureDevService.findIntegration(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:siteId')
  async createIntegrationAndGetProjects(
    @GetUser() user: User,
    @Param('siteId') siteId: string,
  ) {
    return this.azureDevService.createIntegrationAndGetProjects(user, siteId);
  }

  // @Post('projects')
  // @UseGuards(JwtAuthGuard)
  // async setProjects(@GetUser() user: User) {
  //   return this.azureDevService.setProjectStatuses(user);
  // }
  @UseGuards(JwtAuthGuard)
  @Get('projects')
  async getProjects(@GetUser() user: User) {
    return await this.azureDevService.getIntegratedProjectStatusesAndPriorities(
      user,
    );
  }
}
