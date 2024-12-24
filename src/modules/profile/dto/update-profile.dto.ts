import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @IsString()
  @IsNotEmpty({ message: 'Bio is required' })
  @MaxLength(101, { message: 'Bio must be at least 101 characters long' })
  bio: string;
}
