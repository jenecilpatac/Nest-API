import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsString()
  @IsNotEmpty()
  date_of_birth?: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Length(11, 11, { message: 'Phone number must be 11 digits' })
  @Matches(/^\d{11}$/, { message: 'Phone number must be a valid 11-digit number' })
  phone_number?: string;

  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsNotEmpty()
  password?: string;
}
