import { Module } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from '../../common/strategies/local.strategy';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleStrategy } from '../../common/strategies/google.strategy';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { GitHubStrategy } from '../../common/strategies/github.strategy';
import { GithubAuthGuard } from '../../common/guards/github-auth.guard';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '12hr' },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    ConfigModule,
    UserModule,
    EmailModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy,
    GoogleStrategy,
    GoogleAuthGuard,
    GitHubStrategy,
    GithubAuthGuard,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
