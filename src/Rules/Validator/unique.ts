import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../App/Service/Blog/user.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  async validate(email: string) {
    const user = await this.userService.findByEmail(email);
    return !user;
  }

  defaultMessage() {
    return 'Email already taken';
  }
}

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUsernameUniqueConstraint
  implements ValidatorConstraintInterface
{
  constructor(private userService: UserService) {}

  async validate(username: string) {
    const user = await this.userService.findByUserName(username);
    return !user;
  }

  defaultMessage() {
    return 'Username already taken';
  }
}

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}

export function IsUsernameUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameUniqueConstraint,
    });
  };
}
