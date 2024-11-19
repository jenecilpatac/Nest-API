import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../../Rules/DTO/User/create-user.dto';
import * as bcrypt from 'bcrypt';
import { users } from '@prisma/client';
import { PrismaService } from '../../Prisma/Service/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<users[]> {
    return this.prisma.users.findMany();
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

  findOne(id: string): Promise<users> {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
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

  async save(user: users): Promise<users> {
    return this.prisma.users.update({
      where: { id: user.id },
      data: user,
    });
  }
}
