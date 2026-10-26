import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '@/common/interfaces';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';

@Injectable()
export class ApiResponseHandler<T> implements NestInterceptor<T, ApiResponse<T> | StreamableFile> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T> | StreamableFile> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      // Files (e.g. the Excel export) go out as-is; wrapping them would turn the
      // download into a JSON object.
      map((data) =>
        data instanceof StreamableFile
          ? data
          : {
              status: response.statusCode,
              message: 'Success',
              data: data as T,
            },
      ),
    );
  }
}
