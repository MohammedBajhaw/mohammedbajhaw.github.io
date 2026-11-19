import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES, ErrorCode } from './error-codes';

export interface AppExceptionPayload {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export class AppException extends HttpException {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    code: ErrorCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    message: string = ERROR_MESSAGES[code],
    details?: unknown,
  ) {
    super({ code, message, details }, status);
    this.code = code;
    this.details = details;
  }
}
