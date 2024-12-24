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
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'Role is required' })
  role?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  @IsPasswordMatch('password', { message: 'Passwords do not match' })
  confirmPassword?: string;
}
