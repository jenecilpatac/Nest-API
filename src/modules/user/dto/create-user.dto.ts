import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Validate,
  MinLength,
} from 'class-validator';
import { IsUnique } from '../../../common/pipes/unique.validator';
import { IsPasswordMatch } from '../../../common/pipes/confirm-password.validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name field is required' })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email field is required' })
  @Validate(IsUnique, ['users', 'email'], { message: 'Email is already been taken' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Username field is required' })
  @Validate(IsUnique, ['users', 'username'], {
    message: 'Username is already been taken',
  })
  username?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password field is required' })
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'Role field is required' })
  role?: string;

  @IsString()
  @MinLength(6, {
    message: 'Confirmation Password must be at least 6 characters',
  })
  @IsPasswordMatch('password', { message: 'Passwords do not match' })
  @IsNotEmpty({ message: 'Confirm password field is required' })
  confirmPassword: string;
}
