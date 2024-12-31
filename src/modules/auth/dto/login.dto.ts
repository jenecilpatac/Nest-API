import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username or email field is required' })
  usernameOrEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Password field is required' })
  password: string;
  
  rememberToken?: string;
}
