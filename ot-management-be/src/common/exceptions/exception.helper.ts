import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from './http-exceptions';

export const ExceptionHelper = {
  throwBadRequest(message?: string, errorCode?: string): never {
    throw new BadRequestException(message, errorCode);
  },
  throwUnauthorized(message?: string, errorCode?: string): never {
    throw new UnauthorizedException(message, errorCode);
  },
  throwForbidden(message?: string, errorCode?: string): never {
    throw new ForbiddenException(message, errorCode);
  },
  throwNotFound(message?: string, errorCode?: string): never {
    throw new NotFoundException(message, errorCode);
  },
  throwConflict(message?: string, errorCode?: string): never {
    throw new ConflictException(message, errorCode);
  },
  throwInternal(message?: string, errorCode?: string): never {
    throw new InternalServerException(message, errorCode);
  },
};
