import {
  IsString,
  Length,
  Matches,
  IsDate,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { gender } from '@prisma/client';
import { IsBeforeOrEqualToday } from '../../../common/pipes/before-or-equal-today';

export class UpdatePersonalDetailsDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBeforeOrEqualToday({
    message: 'Date of birth must be before or equal to today',
  })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDate({ message: 'Date of birth must be a valid date' })
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Length(11, 11, { message: 'Phone number must be 11 digits' })
  @Matches(/^\d{11}$/, {
    message: 'Phone number must be a valid 11-digit number',
  })
  phoneNumber?: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(gender, { message: "You've selected an invalid gender" })
  @IsOptional()
  gender?: gender;

  @IsString()
  @IsOptional()
  jobTitle?: string;
}
