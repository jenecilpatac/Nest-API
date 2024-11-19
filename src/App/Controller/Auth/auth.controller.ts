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
import { JwtAuthGuard } from '../../Middleware/jwt-auth.guard';
import { UserService } from '../../Service/User/user.service';
import { LoginDto } from '../../../Rules/DTO/Auth/login.dto';
import { RegisterDto } from '../../../Rules/DTO/Auth/register.dto';
import { users } from '@prisma/client';
import { AuthUser } from '../../../Decorator/auth-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(
    @Body()
    loginDto: LoginDto,
  ) {
    const user: users | null = await this.authService.validateUser(loginDto);

    if (!user) {
      return {
        statusCode: 422,
        message: 'No account found or Invalid credentials',
      };
    }

    if (!user.emailVerifiedAt || !user.email) {
      return {
        statusCode: 422,
        message:
          'Your account is not verified yet, please check your email or contact the administrator',
      };
    }

    const { accessToken, rememberToken } = await this.authService.login(
      user,
      loginDto.rememberToken || null,
    );

    return {
      statusCode: 200,
      message: 'Login successful',
      accessToken: accessToken,
      rememberToken: rememberToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@AuthUser() user: any) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      statusCode: 200,
      message: 'Profile fetched successfully',
      user,
    };
  }

  @Post('register')
  async createUser(@Body() registerDto: RegisterDto): Promise<users> {
    return this.authService.create(registerDto);
  }
}
