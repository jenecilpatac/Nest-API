import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  Matches,
  Validate,
  MinLength,
  IsDate,
} from 'class-validator';
import { IsPasswordMatch } from '../../../common/pipes/confirm-password.validator';
import { IsUnique } from '../../../common/pipes/unique.validator';
import { Type } from 'class-transformer';
export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name field is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address field is required' })
  address?: string;

  @IsNotEmpty({ message: 'Date of birth field is required' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsNotEmpty({ message: 'Phone number field is required' })
  @IsString()
  @Length(11, 11, { message: 'Phone number must be 11 digits' })
  @Matches(/^\d{11}$/, {
    message: 'Phone number must be a valid 11-digit number',
  })
  phoneNumber?: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email field is required' })
  @Validate(IsUnique, ['users', 'email'], { message: 'Email already taken' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Username field is required' })
  @Validate(IsUnique, ['users', 'username'], {
    message: 'Username already taken',
  })
  username?: string;

  @IsNotEmpty({ message: 'Password field is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsString()
  password?: string;

  @IsNotEmpty({ message: 'Confirm password field is required' })
  @MinLength(6, {
    message: 'Confirmation Password must be at least 6 characters',
  })
  
  @IsPasswordMatch(('password'), { message: 'Passwords do not match' })
  @IsString()
  confirmPassword: string;
}
