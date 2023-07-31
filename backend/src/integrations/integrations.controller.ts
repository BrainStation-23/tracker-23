import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getIntegrations(@GetUser() user: User) {
    return this.integrationsService.getIntegrations(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteIntegration(@GetUser() user: User, @Param('id') id: number) {
    return this.integrationsService.deleteIntegration(user, id);
  }
}
