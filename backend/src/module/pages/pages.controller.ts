import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Get,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/guard';
@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async createPage(
    @GetUser() user: User,
    @Body() createPageDto: CreatePageDto,
  ) {
    return await this.pagesService.createPage(user, createPageDto);
  }
  @Get()
  async getPages(@GetUser() user: User) {
    return await this.pagesService.getPages(user);
  }

  @Patch(':id')
  async updatePage(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return await this.pagesService.updatePage(+id, updatePageDto.name);
  }

  @Delete(':id')
  async removePage(@Param('id') id: string) {
    return await this.pagesService.removePage(+id);
  }
}
