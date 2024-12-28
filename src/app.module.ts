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
  ],
  providers: [
    IsUnique,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
