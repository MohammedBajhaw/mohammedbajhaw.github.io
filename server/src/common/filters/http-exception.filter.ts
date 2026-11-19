import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '../errors/app.exception';
import { ERROR_MESSAGES, ErrorCode } from '../errors/error-codes';

interface NormalizedError {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function statusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.RESOURCE_NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 413:
      return ErrorCode.PAYLOAD_TOO_LARGE;
    case 429:
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.INTERNAL_SERVER_ERROR;
  }
}

function normalizeMulterError(code: unknown): NormalizedError {
  switch (code) {
    case 'LIMIT_FILE_SIZE':
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        code: ErrorCode.FILE_TOO_LARGE,
        message: ERROR_MESSAGES[ErrorCode.FILE_TOO_LARGE],
      };
    case 'LIMIT_FILE_COUNT':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.BAD_REQUEST,
        message: 'Only one file can be uploaded per request.',
      };
    case 'LIMIT_UNEXPECTED_FILE':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.BAD_REQUEST,
        message: 'Unexpected upload field. Please send the file under the "file" field.',
      };
    default:
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.BAD_REQUEST,
        message: 'The uploaded multipart request is invalid.',
      };
  }
}

function normalizeException(exception: unknown): NormalizedError {
  if (exception instanceof AppException) {
    return {
      statusCode: exception.getStatus(),
      code: exception.code,
      message: exception.message,
      ...(exception.details !== undefined ? { details: exception.details } : {}),
    };
  }

  if (isRecord(exception)) {
    if (exception.name === 'MulterError') {
      return normalizeMulterError(exception.code);
    }

    if (exception.type === 'entity.too.large' || exception.status === 413) {
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        code: ErrorCode.PAYLOAD_TOO_LARGE,
        message: ERROR_MESSAGES[ErrorCode.PAYLOAD_TOO_LARGE],
      };
    }

    if (
      exception.type === 'entity.parse.failed' ||
      (exception instanceof SyntaxError && exception.status === 400)
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.INVALID_JSON,
        message: ERROR_MESSAGES[ErrorCode.INVALID_JSON],
      };
    }
  }

  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    const rawResponse = exception.getResponse();

    if (statusCode === 429) {
      return {
        statusCode,
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message: ERROR_MESSAGES[ErrorCode.RATE_LIMIT_EXCEEDED],
      };
    }

    if (isRecord(rawResponse)) {
      const rawMessage = rawResponse.message;
      if (Array.isArray(rawMessage)) {
        return {
          statusCode,
          code: ErrorCode.VALIDATION_ERROR,
          message: ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR],
          details: rawMessage,
        };
      }
      if (typeof rawMessage === 'string') {
        const cleanMessage =
          statusCode === 404 && rawMessage.startsWith('Cannot ')
            ? 'The requested endpoint or resource was not found.'
            : rawMessage;
        return {
          statusCode,
          code: statusToErrorCode(statusCode),
          message: cleanMessage,
        };
      }
    }

    return {
      statusCode,
      code: statusToErrorCode(statusCode),
      message: typeof rawResponse === 'string' ? rawResponse : exception.message,
    };
  }

  if (isRecord(exception)) {
    if (exception.code === 11000) {
      return {
        statusCode: HttpStatus.CONFLICT,
        code: ErrorCode.DUPLICATE_KEY,
        message: ERROR_MESSAGES[ErrorCode.DUPLICATE_KEY],
        ...(isRecord(exception.keyValue) ? { details: exception.keyValue } : {}),
      };
    }

    if (exception.name === 'CastError') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.INVALID_IDENTIFIER,
        message: ERROR_MESSAGES[ErrorCode.INVALID_IDENTIFIER],
      };
    }

    if (exception.name === 'ValidationError') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.VALIDATION_ERROR,
        message: ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR],
        ...(isRecord(exception.errors) ? { details: Object.keys(exception.errors) } : {}),
      };
    }

    if (
      exception.name === 'MongoNetworkError' ||
      exception.name === 'MongoServerSelectionError'
    ) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: ErrorCode.SERVICE_UNAVAILABLE,
        message: ERROR_MESSAGES[ErrorCode.SERVICE_UNAVAILABLE],
      };
    }
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR],
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const normalized = normalizeException(exception);
    const requestIdHeader = response.getHeader('X-Request-Id');
    const requestId =
      typeof requestIdHeader === 'string' ? requestIdHeader : undefined;

    if (normalized.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${normalized.statusCode} [${normalized.code}] ${normalized.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${normalized.statusCode} [${normalized.code}] ${normalized.message}`,
      );
    }

    response.status(normalized.statusCode).json({
      success: false,
      error: {
        code: normalized.code,
        statusCode: normalized.statusCode,
        message: normalized.message,
        ...(normalized.details !== undefined ? { details: normalized.details } : {}),
      },
      path: request.url,
      ...(requestId ? { requestId } : {}),
      timestamp: new Date().toISOString(),
    });
  }
}
