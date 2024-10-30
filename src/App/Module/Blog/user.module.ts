import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from '../../Controller/Blog/user.controller';
import { UserService } from '../../Service/Blog/user.service';
import { Users } from '../../../Database/Entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
