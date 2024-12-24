import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { users } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user-dto';

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

    const { confirmPassword, role, ...userDetails } = createUserDto;

    return this.prisma.users.create({
      data: {
        ...userDetails,
        password: hashedPassword,
        roles: {
          connect: {
            id: parseInt(role, 10),
          },
        },
        emailVerifiedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<(users & { roles: any }) | undefined> {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
        profile_pictures: {
          orderBy: [
            {
              createdAt: 'desc',
            },
          ],
        },
        posts: {
          include: {
            category: true,
            user: {
              include: {
                profile_pictures: {
                  select: {
                    isSet: true,
                    avatar: true,
                  },
                  where: {
                    isSet: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async findByUserName(username: string): Promise<users | undefined> {
    return this.prisma.users.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<users | undefined> {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async findByRememberToken(rememberToken: string): Promise<users | undefined> {
    return this.prisma.users.findUnique({ where: { rememberToken } });
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    idParam: string,
  ): Promise<any> {
    const {
      role,
      confirmPassword,
      password,
      email,
      username,
      oldPassword,
      ...userDetails
    } = updateUserDto;

    let errors: any = {};

    const [emailExists, usernameExists, user] = await Promise.all([
      this.findByEmail(email),
      this.findByUserName(username),
      this.findById(idParam),
    ]);

    const isPasswordValid = oldPassword
      ? await bcrypt.compare(oldPassword, user.password)
      : false;

    if (usernameExists && usernameExists.id !== idParam) {
      errors.username = { message: 'Username is already exists' };
    }

    if (emailExists && emailExists.id !== idParam) {
      errors.email = { message: 'Email is already exists' };
    }

    if (password) {
      if (password.length < 6) {
        errors.password = { message: 'Password must be at least 6 characters' };
      }

      if (password === oldPassword) {
        errors.password = { message: 'Make sure password is different' };
      }
    }
    if (oldPassword) {
      if (oldPassword.length < 6) {
        errors.oldPassword = {
          message: 'Old password must be at least 6 characters',
        };
      }

      if (!isPasswordValid) {
        errors.oldPassword = {
          message: 'Old password is incorrect',
        };
      }
    } else if (password) {
      errors.oldPassword = { message: 'Old password is required' };
    }

    if (Object.keys(errors).length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    const dataToUpdate: any = {
      ...userDetails,
      email: email,
      username: username,
      roles: {
        set: {
          id: parseInt(role, 10),
        },
      },
    };

    if (password) {
      const hashedPassword = await this.hashPassword(password);

      dataToUpdate.password = hashedPassword;
    }

    return this.prisma.users.update({
      where: { id: idParam },
      data: dataToUpdate,
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

  delete(userId: string) {
    return this.prisma.users.delete({
      where: { id: userId },
    });
  }
}
