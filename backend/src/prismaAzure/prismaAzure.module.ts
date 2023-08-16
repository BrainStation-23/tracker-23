import { Global, Module } from '@nestjs/common';
import { PrismaAzureService } from './prismaAzure.service';

@Global()
@Module({
  providers: [PrismaAzureService],
  exports: [PrismaAzureService],
})
export class PrismaAzureModule {}
