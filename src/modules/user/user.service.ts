import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { users } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { PaginationDto } from './dto/pagination-dto';
import {
  DEFAULT_CHAT_MESSAGES_TAKE,
  DEFAULT_PAGE_SIZE,
} from '../../common/utils/constants';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAll(query: any, userId: string) {
    const { take, searchTerm } = query;

    const users = await this.prisma.users.findMany({
      take: parseInt(take) || DEFAULT_CHAT_MESSAGES_TAKE,
      where:
        searchTerm && 'anonymous'.includes(searchTerm.toLowerCase().trim())
          ? { name: null }
          : searchTerm
            ? {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              }
            : {},
      include: {
        profile_pictures: {
          select: {
            avatar: true,
            isSet: true,
          },
          where: {
            isSet: true,
          },
        },
        senderChats: true,
        receiverChats: true,
        _count: {
          select: {
            messages: {
              where: {
                chatId: null,
              },
            },
          },
        },
        messages: {
          where: {
            chatId: null,
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
    });

    const totalData = await this.prisma.users.count({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            name: searchTerm === 'Anonymous' ? null : undefined,
          },
          {
            name: searchTerm === '' ? '' : undefined,
          },
        ],
      },
    });

    const totalUsersChatted = await this.prisma.users.count({
      where: {
        messages: {
          some: {
            chatId: null,
          },
        },
      },
    });

    return {
      users,
      totalData,
      totalUsersChatted,
    };
  }

  async findAll(userId: string, paginationDto: PaginationDto): Promise<any> {
    const users = await this.prisma.users.findMany({
      skip: parseInt(
        ((paginationDto.skip - 1) *
          (paginationDto.take || DEFAULT_PAGE_SIZE)) as any,
      ),
      take: parseInt(paginationDto.take as any) || DEFAULT_PAGE_SIZE,
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

    const total = await this.prisma.users.count({
      where: {
        id: {
          not: userId,
        },
      },
    });

    return {
      users,
      total,
    };
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
            id: parseInt(role),
          },
        },
        emailVerifiedAt: new Date(),
      },
    });
  }

  async findForSeo(id: string): Promise<any> {
    return this.prisma.users.findUnique({
      where: { id },
      select: {
        name: true,
        id: true,
        address: true,
        jobTitle: true,
        phoneNumber: true,
        bio: true,
        profile_pictures: {
          select: {
            avatar: true,
            isSet: true,
          },
          where: {
            isSet: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<any> {
    return await this.prisma.users.findUnique({
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
      },
    });
  }

  async findByUserName(username: string): Promise<users | undefined> {
    return this.prisma.users.findUnique({
      where: { username },
      include: {
        profile_pictures: {
          orderBy: [
            {
              createdAt: 'desc',
            },
          ],
        },
        posts: {
          where: {
            publishedAs: 'public',
          },
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
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
            likes: {
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
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
            },
            comments: {
              select: {
                userId: true,
                comment: true,
                createdAt: true,
                user: {
                  select: {
                    name: true,
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
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
      errors.oldPassword = { message: 'Old password field is required' };
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
          id: parseInt(role),
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
