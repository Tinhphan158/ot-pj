import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BadRequestException extends BaseException {
  constructor(message = 'Bad request', errorCode = 'BAD_REQUEST') {
    super({ message, statusCode: HttpStatus.BAD_REQUEST, errorCode });
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super({ message, statusCode: HttpStatus.UNAUTHORIZED, errorCode });
  }
}

export class ForbiddenException extends BaseException {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super({ message, statusCode: HttpStatus.FORBIDDEN, errorCode });
  }
}

export class NotFoundException extends BaseException {
  constructor(message = 'Not found', errorCode = 'NOT_FOUND') {
    super({ message, statusCode: HttpStatus.NOT_FOUND, errorCode });
  }
}

export class ConflictException extends BaseException {
  constructor(message = 'Conflict', errorCode = 'CONFLICT') {
    super({ message, statusCode: HttpStatus.CONFLICT, errorCode });
  }
}

export class InternalServerException extends BaseException {
  constructor(message = 'Internal server error', errorCode = 'INTERNAL_SERVER_ERROR') {
    super({ message, statusCode: HttpStatus.INTERNAL_SERVER_ERROR, errorCode });
  }
}
