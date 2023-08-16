import { Global, Module } from '@nestjs/common';
import { PrismaService2 } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService2],
  exports: [PrismaService2],
})
export class PrismaModule2 {}
