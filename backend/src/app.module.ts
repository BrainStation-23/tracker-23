import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { SessionsModule } from './sessions/sessions.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ExportModule } from './export/export.module';
// import { WebhooksModule } from './webhooks/webhooks.module';
import { NotificationModule } from './notifications/notifications.module';
import { SprintsModule } from './sprints/sprints.module';
import { JiraModule } from './integrations/jira/jira.module';
import { TestModule } from './test/test.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { PrismaModule2 } from './prisma2/prisma.module';
import { DataMigrationModule } from './data_migration/data_migration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TestModule,
    AuthModule,
    PrismaModule,
    PrismaModule2,
    TasksModule,
    SessionsModule,
    WorkspacesModule,
    IntegrationsModule,
    ExportModule,
    // WebhooksModule,
    NotificationModule,
    SprintsModule,
    JiraModule,
    DataMigrationModule,
  ],
})
export class AppModule {}
