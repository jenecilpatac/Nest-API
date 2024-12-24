import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { GithubAuthGuard } from '../../common/guards/github-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';

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
    const user: any | null = await this.authService.validateUser(loginDto);

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
  @SkipThrottle()
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
  async createUser(@Body() registerDto: RegisterDto): Promise<any> {
    return this.authService.create(registerDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req, @Res() res) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleRedirect(@Req() req, @Res() res) {
    const data = req.user;
    res.redirect(
      301,
      `http://136.239.196.178:5005/success?token=${data.jwtToken}&rememberToken=${data.user.rememberToken}&email=${data.user.email}`,
    );
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  async githubAuth(@Req() req, @Res() res) {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  githubRedirect(@Req() req, @Res() res) {
    const data = req.user;
    res.redirect(
      301,
      `http://136.239.196.178:5005/success?token=${data.jwtToken}&rememberToken=${data.user.rememberToken}&email=${data.user.email}`,
    );
  }
}
