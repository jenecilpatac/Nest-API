import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../../Rules/DTO/Blog/create-user.dto';
import { Users } from '../../../Database/Entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  findAll(): Promise<Users[]> {
    return this.userRepository.find();
  }

  async create(createUserDto: CreateUserDto): Promise<Users> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  findOne(id: string): Promise<Users> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findById(id: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUserName(username: string): Promise<Users | any> {
    if (!username) {
      return {
        message: 'Eeeee',
      };
    }
    return {
      statusCode: 422,
      data: this.userRepository.findOne({ where: { username } }),
    };
  }

  async findByEmail(email: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByRememberToken(
    remember_token: string,
  ): Promise<Users | undefined> {
    return this.userRepository.findOne({ where: { remember_token } });
  }

  async save(user: Users): Promise<Users> {
    return this.userRepository.save(user);
  }
}
