import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { IsPasswordMatch } from '../../Validator/confirm-password.validator';
export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address?: string;

  @IsString()
  @IsNotEmpty({ message: 'Date of birth is required' })
  date_of_birth?: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Length(11, 11, { message: 'Phone number must be 11 digits' })
  @Matches(/^\d{11}$/, {
    message: 'Phone number must be a valid 11-digit number',
  })
  phone_number?: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username?: string;

  @IsNotEmpty({ message: 'Password is required' })
  password?: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsPasswordMatch('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
