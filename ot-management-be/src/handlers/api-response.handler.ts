import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '@/common/interfaces';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class ApiResponseHandler<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => ({
        status: response.statusCode,
        message: 'Success',
        data: data as T,
      })),
    );
  }
}
