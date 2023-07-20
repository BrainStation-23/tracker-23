import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { SessionsModule } from './sessions/sessions.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ExportModule } from './export/export.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { NotificationModule } from './notifications/notifications.module';
import { SprintsModule } from './sprints/sprints.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { JiraModule } from './integrations/jira/jira.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    TasksModule,
    SessionsModule,
    IntegrationsModule,
    ExportModule,
    WebhooksModule,
    NotificationModule,
    SprintsModule,
    WorkspacesModule,
    JiraModule,
  ],
})
export class AppModule {}
