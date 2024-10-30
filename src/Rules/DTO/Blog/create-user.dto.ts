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

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @Matches(/^\d{11}$/, { message: 'phone_number must be exactly 11 digits' })
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
