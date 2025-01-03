import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async update(userId: string, updateSettingDto: UpdateSettingDto) {
    const { confirmNewPassword, oldPassword, newPassword } = updateSettingDto;

    let errors: any = {};

    const user = await this.userService.findById(userId);

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      errors.oldPassword = { message: 'Old password is incorrect' };
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        errors.newPassword = {
          message: 'New password must be at least 6 characters',
        };
      }

      if (newPassword === oldPassword) {
        errors.newPassword = {
          message: 'Make sure new password and old password is different',
        };
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
    } else if (newPassword) {
      errors.oldPassword = { message: 'Old password field is required' };
    }

    if (Object.keys(errors).length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.userService.hashPassword(newPassword);

    return this.prisma.users.updateMany({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  updatePersonalInfo(userId: string, updateSettingDto: UpdateSettingDto) {
    const { newPassword, confirmNewPassword, oldPassword, dateOfBirth, email, ...rest } =
      updateSettingDto;
    return this.prisma.users.updateMany({
      where: {
        id: userId,
      },
      data: {
        ...rest,
        dateOfBirth: new Date(dateOfBirth),
      },
    });
  }
}
