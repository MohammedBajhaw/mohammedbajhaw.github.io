import { randomUUID } from 'node:crypto';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditService } from '@/audit/audit.service';
import { AppException } from '../errors/app.exception';
import { ErrorCode } from '../errors/error-codes';

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('OperationsLog');

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const incomingId = request.headers['x-request-id'];
    const trimmedId = typeof incomingId === 'string' ? incomingId.trim() : '';
    const requestId = SAFE_REQUEST_ID_REGEX.test(trimmedId)
      ? trimmedId
      : randomUUID();

    response.setHeader('X-Request-Id', requestId);

    const startedAt = Date.now();
    const method = request.method;
    const path = request.originalUrl || request.url;
    const ip = request.ip;
    const userAgentHeader = request.headers['user-agent'];
    const userAgent =
      typeof userAgentHeader === 'string' ? userAgentHeader : undefined;

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        const statusCode = response.statusCode;

        this.logger.log(
          `[${requestId}] ${method} ${path} -> ${statusCode} (${durationMs}ms)`,
        );

        void this.auditService.record({
          requestId,
          method,
          path,
          statusCode,
          outcome: 'success',
          durationMs,
          ip,
          userAgent,
        });
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startedAt;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;
        const errorCode =
          error instanceof AppException
            ? error.code
            : statusCode === 404
              ? ErrorCode.RESOURCE_NOT_FOUND
              : ErrorCode.INTERNAL_SERVER_ERROR;
        const errorMessage =
          error instanceof Error ? error.message : 'Unexpected error';

        void this.auditService.record({
          requestId,
          method,
          path,
          statusCode,
          outcome: 'error',
          durationMs,
          ip,
          userAgent,
          errorCode,
          errorMessage,
        });

        return throwError(() => error);
      }),
    );
  }
}
