import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';
import { IsUnique } from '../../../common/pipes/unique.validator';
import { IsPasswordMatch } from '../../../common/pipes/confirm-password.validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name field is required' })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email field is required' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Username field is required' })
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'Role field is required' })
  role?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  @IsPasswordMatch('password', { message: 'Passwords do not match' })
  confirmPassword?: string;
}
