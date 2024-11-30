import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { users } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string): Promise<users[]> {
    return this.prisma.users.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        roles: true,
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async create(createUserDto: CreateUserDto): Promise<users> {
    const hashedPassword = await this.hashPassword(createUserDto.password);

    return this.prisma.users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findById(id: string): Promise<(users & { roles: any }) | undefined> {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });
  }

  async findByUserName(username: string): Promise<users | undefined> {
    return this.prisma.users.findUnique({ where: { username } });
  }

  async findByEmail(email: string): Promise<users | undefined> {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async findByRememberToken(rememberToken: string): Promise<users | undefined> {
    return this.prisma.users.findUnique({ where: { rememberToken } });
  }

  async updateUser(user: users): Promise<users> {
    return this.prisma.users.update({
      where: { id: user.id },
      data: user,
    });
  }

  async verifyUser(user: users): Promise<any> {
    if (!user) {
      throw new Error('User not found');
    }

    if (user && user.emailVerifiedAt === null) {
      return this.prisma.users.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
        },
      });
    } else {
      throw new Error('User already verified');
    }
  }

  async updateUserRoles(userId: string, roles: any): Promise<any> {
    return this.prisma.users.update({
      where: { id: userId },
      data: {
        roles: {
          set: roles,
        },
      },
    });
  }
}
