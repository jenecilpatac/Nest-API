import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Delete,
  HttpException,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateUserDto } from './dto/update-user-dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @SkipThrottle()
  @Roles('superadmin', 'admin', 'moderator')
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
  async createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.userService.create(createUserDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @SkipThrottle()
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @SkipThrottle()
  async deleteUser(@Param('id') id: string) {
    const user = await this.userService.delete(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin', 'moderator')
  @SkipThrottle()
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(updateUserDto, id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      user,
    };
  }
}
