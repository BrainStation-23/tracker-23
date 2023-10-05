import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExportModule } from './module/export/export.module';
import { TestModule } from './test/test.module';
import { AuthModule } from './module/auth/auth.module';
import { PrismaModule } from './module/prisma/prisma.module';
import { TasksModule } from './module/tasks/tasks.module';
import { SessionsModule } from './module/sessions/sessions.module';
import { IntegrationsModule } from './module/integrations/integrations.module';
import { WorkspacesModule } from './module/workspaces/workspaces.module';
import { NotificationModule } from './module/notifications/notifications.module';
import { SprintsModule } from './module/sprints/sprints.module';
import { JiraModule } from './module/jira/jira.module';
import { EmailModule } from './module/email/email.module';
import { PrismaModule2 } from './module/prisma2/prisma.module';
import { DataMigrationModule } from './module/data_migration/data_migration.module';
import { ProjectsModule } from './module/projects/projects.module';
import { WebhooksModule } from './module/webhooks/webhooks.module';
import { UsersModule } from './module/user/users.module';
import { CronService } from './module/cron/cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TestModule,
    AuthModule,
    PrismaModule,
    // PrismaModule2,
    TasksModule,
    SessionsModule,
    WorkspacesModule,
    IntegrationsModule,
    ExportModule,
    WebhooksModule,
    NotificationModule,
    SprintsModule,
    JiraModule,
    // DataMigrationModule,
    EmailModule,
    ProjectsModule,
    UsersModule,
  ],
  providers: [CronService],
})
export class AppModule {}
