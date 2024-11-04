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
import { LoginDto } from '../../../Rules/DTO/Auth/login.dto';
import { RegisterDto } from '../../../Rules/DTO/Auth/register.dto';

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
    const user: Users | null = await this.authService.validateUser(loginDto);
    if (!user) {
      return { statusCode: 422, message: 'Invalid credentials' };
    }
    const { accessToken, remember_token } = await this.authService.login(
      user,
      loginDto.remember_token || null,
    );

    if (user.email_verified_at === null) {
      return {
        statusCode: 422,
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

  @Post('register')
  async createUser(@Body() registerDto: RegisterDto): Promise<Users> {
    return this.userService.create(registerDto);
  }
}
