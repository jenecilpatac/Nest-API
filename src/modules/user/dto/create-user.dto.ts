import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  Matches,
  IsDate,
  Validate,
} from 'class-validator';
import { IsUnique } from '../../../common/pipes/unique.validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Length(11, 11, { message: 'Phone number must be 11 digits' })
  @Matches(/^\d{11}$/, {
    message: 'Phone number must be a valid 11-digit number',
  })
  phoneNumber?: string;

  @IsEmail()
  @IsNotEmpty()
  @Validate(IsUnique, ['users', 'email'], { message: 'Email already taken' })
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsUnique, [
    'users',
    'username',
    { message: 'Username already taken' },
  ])
  username?: string;

  @IsNotEmpty()
  password?: string;
}
