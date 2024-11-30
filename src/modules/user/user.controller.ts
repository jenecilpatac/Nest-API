import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { users } from '@prisma/client';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@AuthUser() user): Promise<any> {
    const users = await this.userService.findAll(user.id);

    if (users.length === 0) {
      return {
        statusCode: 404,
        message: 'No users found',
      };
    }
    return {
      statusCode: 200,
      message: 'Users fetched successfully',
      users: users,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create-user')
  @Roles('superadmin', 'admin', 'moderator')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<users> {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<any> {
    const user = await this.userService.findById(id);
    if (!user) {
      return {
        statusCode: 404,
        message: 'No user found on this id',
      };
    }
    return {
      statusCode: 200,
      message: 'User fetched successfully',
      user: user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin', 'moderator')
  @Post('verify-user/:id')
  async verifyUser(@Param('id') id: string): Promise<any> {
    const user = await this.userService.findById(id);

    if (!user) {
      return {
        statusCode: 404,
        message: 'No user found on this id',
      };
    }

    if (user.emailVerifiedAt !== null) {
      return {
        statusCode: 400,
        message: 'User already verified',
      };
    }

    const userVerified = await this.userService.verifyUser(user);

    return {
      statusCode: 200,
      message: 'User verified successfully',
      userVerified,
    };
  }
}
