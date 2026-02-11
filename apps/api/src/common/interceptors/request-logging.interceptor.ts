import { randomUUID } from 'node:crypto';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = this.resolveRequestId(request);
    const startedAt = Date.now();

    response.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            requestId,
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          }),
        );
      }),
      catchError((error: unknown) => {
        this.logger.error(
          JSON.stringify({
            requestId,
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
            error:
              error instanceof Error
                ? error.message
                : 'Unexpected runtime error',
          }),
        );
        return throwError(() => error);
      }),
    );
  }

  private resolveRequestId(request: Request): string {
    const headerValue = request.headers['x-request-id'];

    if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
      return headerValue;
    }

    return randomUUID();
  }
}
