import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getIntegrations(@GetUser() user: User) {
    return await this.integrationsService.getIntegrations(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/:id') //integration id
  async deleteIntegration(@GetUser() user: User, @Param('id') id: number) {
    return await this.integrationsService.deleteIntegration(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:integrationId')
  // need to add role system
  async deleteIntegrationByAdmin(
    @GetUser() user: User,
    @Param('integrationId') integrationId: number,
  ) {
    return await this.integrationsService.deleteIntegrationByAdmin(
      user,
      integrationId,
    );
  }
}
