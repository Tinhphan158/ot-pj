import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { method, originalUrl } = request;
    const startedAt = Date.now();

    response.once('finish', () => {
      const durationMs = Date.now() - startedAt;
      this.logger.log(`<-- ${method} ${originalUrl} | status: ${response.statusCode} | duration: ${durationMs}ms`);
    });

    return next.handle();
  }
}
