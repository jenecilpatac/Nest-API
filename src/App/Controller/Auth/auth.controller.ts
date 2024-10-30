import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../Service/Auth/auth.service';
import { LocalAuthGuard } from '../../Middleware/local-auth.guard';
import { Users } from '../../../Database/Entity/user.entity';
import { JwtAuthGuard } from '../../Middleware/jwt-auth.guard';
import { UserService } from '../../Service/Blog/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body()
    body: {
      usernameOrEmail: string;
      password: string;
      remember_token?: string;
    },
  ) {
    const user: Users | null = await this.authService.validateUser(
      body.usernameOrEmail,
      body.password,
    );
    if (!user) {
      return { statusCode: 401, message: 'Invalid credentials' };
    }
    const { accessToken, remember_token } = await this.authService.login(
      user,
      body.remember_token || null,
    );

    if (user.email_verified_at === null) {
      return {
        statusCode: 401,
        message: 'Email not found or not verified yet',
      };
    }

    return {
      statusCode: 200,
      message: 'Login successful',
      accessToken: accessToken,
      remember_token: remember_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      statusCode: 200,
      message: 'Profile fetched successfully',
      user,
    };
  }
}
