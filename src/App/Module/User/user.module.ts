import { Module } from '@nestjs/common';
import { UserController } from '../../Controller/User/user.controller';
import { UserService } from '../../Service/User/user.service';
import { PrismaModule } from '../../Prisma/Module/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
