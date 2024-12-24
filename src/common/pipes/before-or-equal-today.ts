import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsBeforeOrEqualToday(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsBeforeOrEqualToday',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!(value instanceof Date)) return false;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return value <= today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be before or equal to today`;
        },
      },
    });
  };
}
