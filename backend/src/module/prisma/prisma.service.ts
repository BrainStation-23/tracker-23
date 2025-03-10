import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient as Database1PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends Database1PrismaClient
  implements OnModuleInit
{
  // connection test
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Database 1 connection successful!');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  }

  constructor(config: ConfigService) {
    const url = config.get('DATABASE_URL');
    // if (config.get('BACKEND_MODE') !== 'DEV') {
    //   url = `postgres://${config.get('AZURE_POSTGRESQL_USER')}:${config.get(
    //     'AZURE_POSTGRESQL_PASSWORD',
    //   )}@${config.get('AZURE_POSTGRESQL_HOST')}:${config.get(
    //     'AZURE_POSTGRESQL_PORT',
    //   )}/${config.get('AZURE_POSTGRESQL_DATABASE')}`;
    // }
    super({
      datasources: {
        db: {
          url: url,
        },
      },
    });
  }

  cleanDB() {
    return this.$transaction([this.user.deleteMany()]);
  }
}
