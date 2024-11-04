import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../Blog/user.service';
import * as bcrypt from 'bcrypt';
import { Users } from '../../../Database/Entity/user.entity';
import * as crypto from 'crypto';
import { LoginDto } from '../../../Rules/DTO/Auth/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user =
      (await this.userService.findByUserName(loginDto.usernameOrEmail)) ||
      (await this.userService.findByEmail(loginDto.usernameOrEmail));

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Users, remember_token: string) {
    const payload = { username: user.username, sub: user.id };

    if (!user.remember_token || remember_token === null) {
      remember_token = this.generateRememberToken();
      user.remember_token = remember_token;

      await this.userService.save(user);
    }
    
    const accessToken = this.jwtService.sign({ ...payload, remember_token });
    return { accessToken, remember_token };
  }

  private generateRememberToken() {
    return crypto.randomBytes(64).toString('hex');
  }
}
