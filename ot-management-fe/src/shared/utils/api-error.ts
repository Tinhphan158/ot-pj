import { AxiosError } from 'axios';
import type { ApiErrorShape, FieldError } from '@/shared/types/api.type';

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  errors?: FieldError[];

  constructor(message: string, statusCode: number, errorCode: string, errors?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorShape | undefined;
    if (data) {
      return new ApiError(data.message, data.statusCode ?? error.response?.status ?? 500, data.errorCode ?? 'ERROR', data.errors);
    }
    return new ApiError(error.message || 'Network error', error.response?.status ?? 500, 'NETWORK_ERROR');
  }

  if (error instanceof Error) return new ApiError(error.message, 500, 'UNKNOWN_ERROR');
  return new ApiError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
