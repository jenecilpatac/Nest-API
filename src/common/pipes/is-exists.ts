import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

export function IsExists(entity: string, field: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const prisma = new PrismaService();

          if (!value) return true;

          const id = parseInt(value);

          const record = await prisma[entity].findUnique({
            where: { [field]: value | id },
          });

          return !!record;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} does not exist`;
        },
      },
    });
  };
}
