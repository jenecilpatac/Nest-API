import { Controller, Get, HttpException, Param, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Get(':id/email-verification')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  async emailVerfification(@Param('id') id: string, @Res() res) {
    const user = await this.userService.findById(id);
    if (user.emailVerifiedAt !== null) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?errorVerification=Email already verified or email verification token is already expired`,
      );
    }

    await this.emailService.emailVerified(id);

    return res.redirect(
      `${process.env.CLIENT_URL}/login?successVerification=Email Verified sucessfully. You can now login to your account`,
    );
  }
}
