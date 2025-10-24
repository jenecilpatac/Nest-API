import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './modules/blog/post.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { IsUnique } from './common/pipes/unique.validator';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CategoryModule } from './modules/category/category.module';
import { TodoModule } from './modules/todo/todo.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RoleModule } from './modules/role/role.module';
import { CommentsModule } from './modules/comments/comments.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmailService } from './modules/email/email.service';
import { EmailModule } from './modules/email/email.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot(),
    PostModule,
    UserModule,
    AuthModule,
    CategoryModule,
    PrismaModule,
    TodoModule,
    ProfileModule,
    RoleModule,
    CommentsModule,
    SettingsModule,
    DashboardModule,
    EmailModule,
    ChatsModule,
    ChatMessagesModule,
  ],
  providers: [
    IsUnique,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    EmailService,
  ],
})
export class AppModule {}
