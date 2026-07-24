import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { BaseException, BaseFieldError } from './base.exception';

export class ValidationException extends BaseException {
  constructor(errors: ValidationError[]) {
    super({
      message: 'Validation failed',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errorCode: 'VALIDATION_ERROR',
      errors: ValidationException.format(errors),
    });
  }

  private static format(errors: ValidationError[]): BaseFieldError[] {
    return errors.map((error) => ({
      field: error.property,
      message: Object.values(error.constraints ?? {}),
    }));
  }
}
