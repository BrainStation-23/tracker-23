import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit  {

  // connection test
  async onModuleInit() {
    await this.$connect();
  }

  constructor(config: ConfigService) {
    console.log('config.get(DATABASE_URL)==========+L>>>>>',config.get('DATABASE_URL'))
    super({
      datasources: {
        db: {
          url: 'postgresql://tracker23@tracker23-db:jssbubs23#@tracker23-db.postgres.database.azure.com:5432/tracker23?sslmode=require',
        },
      },
    });
  }

  cleanDB() {
    return this.$transaction([this.user.deleteMany()]);
  }
}
