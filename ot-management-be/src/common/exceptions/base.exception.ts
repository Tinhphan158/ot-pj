import { HttpException, HttpStatus } from '@nestjs/common';
import { ERRORS } from '@/utils';

export interface BaseFieldError {
  field: string;
  message: string[];
}

export interface BaseExceptionOptions {
  message: string;
  statusCode?: number;
  errorCode?: string;
  errors?: BaseFieldError[] | null;
}

export class BaseException extends HttpException {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly errors: BaseFieldError[] | null;

  constructor(options: BaseExceptionOptions) {
    super(
      {
        statusCode: options.statusCode || ERRORS.BASE_ERROR.statusCode,
        message: options.message,
        errorCode: options.errorCode || ERRORS.BASE_ERROR.errorCode,
        errors: options.errors || null,
      },
      options.statusCode || HttpStatus.BAD_REQUEST,
    );

    this.statusCode = options.statusCode || ERRORS.BASE_ERROR.statusCode;
    this.errorCode = options.errorCode || ERRORS.BASE_ERROR.errorCode;
    this.errors = options.errors || null;
  }
}
