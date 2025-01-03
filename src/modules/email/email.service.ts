import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  emailVerified(id: string) {
    return this.prisma.users.update({
      where: {
        id,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });
  }

  async sendEmail(mailerOptions: any) {
    await this.mailerService.sendMail({
      ...mailerOptions,
    });
  }
}
