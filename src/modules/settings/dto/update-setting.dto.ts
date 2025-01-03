import { PartialType } from '@nestjs/swagger';
import { CreateSettingDto } from './create-setting.dto';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsPasswordMatch } from '../../../common/pipes/confirm-password.validator';
import { Type } from 'class-transformer';
import { gender } from '@prisma/client';
import { IsBeforeOrEqualToday } from '../../../common/pipes/before-or-equal-today';

export class UpdateSettingDto extends PartialType(CreateSettingDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name field is required' })
  name: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Email field is required' })
  email: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Phone number field is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Length(11, 11, { message: 'Phone number must be 11 digits' })
  @Matches(/^\d{11}$/, {
    message: 'Phone number must be a valid 11-digit number',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsBeforeOrEqualToday({
    message: 'Date of birth must be before or equal to today',
  })
  @IsNotEmpty({ message: 'Date of birth field is required' })
  @IsDate({ message: 'Date of birth must be a valid date' })
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsNotEmpty({ message: 'Gender field is required' })
  @IsEnum(gender, { message: "You've selected an invalid gender" })
  gender?: gender;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Old password field is required' })
  oldPassword: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'New password field is required' })
  newPassword: string;

  @IsOptional()
  @IsString()
  @IsPasswordMatch('newPassword', { message: 'Passwords do not match' })
  @IsNotEmpty({ message: 'Confirm password field is required' })
  confirmNewPassword: string;
}
