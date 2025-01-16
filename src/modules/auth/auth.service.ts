import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import emailVerification from '../../shared/templates/email-verification';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user =
      (await this.userService.findByUserName(loginDto.usernameOrEmail)) ||
      (await this.userService.findByEmail(loginDto.usernameOrEmail));

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any, rememberToken: string) {
    const userDetails = await this.userService.findById(user.id);

    const payload = {
      username: user.username,
      sub: user.id,
      roles: userDetails.roles,
    };

    if (!user.rememberToken || rememberToken === null) {
      rememberToken = this.generateRememberToken();
      user.rememberToken = rememberToken;

      await this.prisma.users.update({
        where: { id: user.id },
        data: { rememberToken },
      });
    }

    const accessToken = this.jwtService.sign(
      { ...payload, rememberToken },
      { expiresIn: '1d' },
    );
    return { accessToken, rememberToken };
  }

  private generateRememberToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async create(registerDto: RegisterDto) {
    const hashedPassword = await this.hashPassword(registerDto.password);

    const { confirmPassword, ...userData } = registerDto;

    const userRole = await this.prisma.roles.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    const user = await this.prisma.users.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: {
          connect: {
            id: userRole.id,
          },
        },
      },
    });

    const mailData = emailVerification({
      name: registerDto.name,
      verificationLink: `${process.env.BACKEND_CALLBACK_URL}/email/${user.id}/email-verification`,
      from: process.env.MAILER_FROM,
    });

    const mailerOptions = {
      to: registerDto.email,
      subject: 'Email Verification',
      html: mailData,
    };

    await this.emailService.sendEmail(mailerOptions);

    return user;
  }

  async validateOAuthUser(profile: any, provider: string): Promise<any> {
    if (!profile.id) {
      throw new Error('No provider ID available from the profile');
    }

    let user = await this.prisma.users.findUnique({
      where: { providerId: profile.id },
      include: { roles: true },
    });

    if (!user) {
      const userRole = await this.prisma.roles.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new Error('User role not found');
      }

      const hashedPassword = await this.userService.hashPassword(
        this.generateRememberToken(),
      );

      const email =
        profile.emails && profile.emails[0] && profile.provider === 'google'
          ? `${profile.emails[0].value}`
          : profile.provider === 'github'
            ? `${profile.emails[0].value} `
            : null;
      if (!email) {
        throw new Error('Email not found in the profile');
      }

      user = await this.prisma.users.create({
        data: {
          username: profile.username
            ? profile.username
            : profile.displayName || 'Unknown',
          email: email,
          password: hashedPassword,
          emailVerifiedAt: new Date(),
          provider,
          name: profile.displayName
            ? profile.displayName
            : profile.username || 'Unknown',
          providerId: profile.id,
          rememberToken: this.generateRememberToken(),
          roles: {
            connect: { id: userRole.id },
          },
        },
        include: { roles: true },
      });
    }

    const jwtToken = await this.generateJwtToken(user);

    return { user, jwtToken };
  }

  async generateJwtToken(user: any): Promise<string> {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
      rememberToken: user.rememberToken,
    };

    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }
}
