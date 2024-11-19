import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../User/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../../Rules/DTO/Auth/login.dto';
import { PrismaService } from '../../Prisma/Service/prisma.service';
import { RegisterDto } from '../../../Rules/DTO/Auth/register.dto';
import { users } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user =
      (await this.userService.findByUserName(loginDto.usernameOrEmail)) ||
      (await this.userService.findByEmail(loginDto.usernameOrEmail));

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: users, rememberToken: string) {
    const payload = { username: user.username, sub: user.id };

    if (!user.rememberToken || rememberToken === null) {
      rememberToken = this.generateRememberToken();
      user.rememberToken = rememberToken;

      await this.prisma.users.update({
        where: { id: user.id },
        data: { rememberToken },
      });
    }

    const accessToken = this.jwtService.sign({ ...payload, rememberToken });
    return { accessToken, rememberToken };
  }

  private generateRememberToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async create(registerDto: RegisterDto) {
    const hashedPassword = await this.hashPassword(registerDto.password);

    const { confirmPassword, ...userData } = registerDto;

    const userRole = await this.prisma.roles.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    const user = await this.prisma.users.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: {
          connect: {
            id: userRole.id,
          },
        },
      },
    });

    return user;
  }
}
