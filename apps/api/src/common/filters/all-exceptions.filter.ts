import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface HttpErrorBody {
  statusCode: number;
  code: string;
  message: string | string[];
  timestamp: string;
  path: string;
  method: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const status = this.resolveStatusCode(exception);
    const code = this.resolveCode(exception, status);
    const message = this.resolveMessage(exception, status);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    }

    const body: HttpErrorBody = {
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(status).json(body);
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return 500;
  }

  private resolveCode(exception: unknown, status: number): string {
    if (status === 401) {
      return 'UNAUTHORIZED';
    }

    if (status === 400) {
      return 'BAD_REQUEST';
    }

    if (status === 404) {
      return 'NOT_FOUND';
    }

    if (status >= 500) {
      return 'INTERNAL_SERVER_ERROR';
    }

    if (exception instanceof HttpException) {
      return exception.name;
    }

    return 'UNKNOWN_ERROR';
  }

  private resolveMessage(
    exception: unknown,
    status: number,
  ): string | string[] {
    if (status >= 500) {
      return 'Internal server error';
    }

    if (!(exception instanceof HttpException)) {
      return 'Unexpected error';
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null) {
      const candidate = (response as { message?: unknown }).message;

      if (Array.isArray(candidate)) {
        return candidate.map((item) => String(item));
      }

      if (typeof candidate === 'string') {
        return candidate;
      }
    }

    return exception.message;
  }
}
