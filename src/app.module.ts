import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// Using nest js typeorm -> primsa
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './App/Module/Blog/post.module';
import { UserModule } from './App/Module/User/user.module';
import { AuthModule } from './App/Module/Auth/auth.module';
import { IsUnique } from './Rules/Validator/unique.validator';
import { PrismaModule } from './App/Prisma/Module/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // Using nest js typeorm -> primsa

    // TypeOrmModule.forRoot({
    //   type: process.env.DB_CONNECTION as any,
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT, 10),
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),
    PostModule,
    UserModule,
    AuthModule,
    PrismaModule,
  ],
  providers: [IsUnique],
})
export class AppModule {}
