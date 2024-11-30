import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../../modules/prisma/prisma.service';

@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUnique implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}
  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const [modelName, column] = args?.constraints as string[];

    const dataExist = await this.prisma[modelName].findFirst({
      where: {
        [column]: value,
      },
    });

    return !dataExist;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const field = validationArguments.property;

    return `${field} is already taken.`;
  }
}
