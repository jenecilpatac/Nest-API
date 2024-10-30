import { Module } from '@nestjs/common';
import { AuthService } from '../../Service/Auth/auth.service';
import { AuthController } from '../../Controller/Auth/auth.controller';
import { LocalStrategy } from '../../../Strategy/local.strategy';
import { LocalAuthGuard } from '../../Middleware/local-auth.guard';
import { UserModule } from '../../Module/Blog/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../../Strategy/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '12hr' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, LocalAuthGuard, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
