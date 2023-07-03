import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // connection test
  // async onModuleInit() {
  //   await this.$connect();
  // }

  constructor(config: ConfigService) {
    let url = config.get('DATABASE_URL');
    console.log(
      'config.get(DATABASE_URL)==========+L>>>>>',
      config.get('DATABASE_URL'),
    );
    if (config.get('BACKEND_MODE') !== 'DEV') {
      url = `postgres://${config.get('AZURE_POSTGRESQL_USER')}:${config.get(
        'AZURE_POSTGRESQL_PASSWORD',
      )}@${config.get('AZURE_POSTGRESQL_HOST')}:${config.get(
        'AZURE_POSTGRESQL_PORT',
      )}/${config.get('AZURE_POSTGRESQL_DATABASE')}`;
    }
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
