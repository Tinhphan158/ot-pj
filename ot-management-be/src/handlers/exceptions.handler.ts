import { Response } from 'express';
import { BaseException, BaseFieldError } from '@/common/exceptions';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class ExceptionsHandler implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsHandler.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string;
    let errorCode: string;
    let errors: BaseFieldError[] | null = null;

    if (exception instanceof BaseException) {
      status = exception.statusCode;
      message = exception.message;
      errorCode = exception.errorCode;
      errors = exception.errors;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res?.message || res || 'Unexpected error';
      errorCode = res?.errorCode || 'HTTP_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorCode = 'INTERNAL_SERVER_ERROR';
    }

    const stack = exception instanceof Error && exception.stack ? exception.stack : JSON.stringify(exception);
    this.logger.error(`[${status}] ${message}`, stack);

    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      ...(errors && { errors }),
    });
  }
}
