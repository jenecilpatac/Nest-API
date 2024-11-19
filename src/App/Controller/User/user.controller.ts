import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../../Service/User/user.service';
import { CreateUserDto } from '../../../Rules/DTO/User/create-user.dto';
import { JwtAuthGuard } from '../../Middleware/jwt-auth.guard';
import { users } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<any> {
    const users = await this.userService.findAll();

    if (users.length === 0) {
      return {
        statusCode: 404,
        message: 'No users found',
      };
    }
    return {
      statusCode: 200,
      users: users,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<users> {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<any> {
    const user = await this.userService.findOne(id);
    if (!user) {
      return {
        statusCode: 404,
        message: 'No user found on this id',
      };
    }
    return user;
  }
}
