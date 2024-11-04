import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../App/Service/Auth/auth.service';
import { LoginDto } from '../Rules/DTO/Auth/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'usernameOrEmail', passwordField: 'password' });
  }

  async validate(loginDto: LoginDto): Promise<any> {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnprocessableEntityException("Invalid credentials");
    }
    return user;
  }
}
