import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppException } from '../errors/app.exception';
import { ErrorCode } from '../errors/error-codes';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_OBJECT_DEPTH = 12;

function stripControlChars(input: string): string {
  let result = '';
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    const isForbiddenControl =
      (code >= 0x01 && code <= 0x08) ||
      code === 0x0b ||
      code === 0x0c ||
      (code >= 0x0e && code <= 0x1f) ||
      code === 0x7f;
    if (!isForbiddenControl) {
      result += input[i];
    }
  }
  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === Object.prototype || proto === null;
}

function sanitizeString(value: string, location: string): string {
  if (value.includes('\u0000')) {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      `Null byte detected in ${location}.`,
    );
  }
  return stripControlChars(value).normalize('NFC');
}

function sanitizeValue(value: unknown, location: string, depth: number): unknown {
  if (depth > MAX_OBJECT_DEPTH) {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      `Input nesting exceeds maximum allowed depth in ${location}.`,
    );
  }

  if (typeof value === 'string') {
    return sanitizeString(value, location);
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = sanitizeValue(value[i], `${location}[${i}]`, depth + 1);
    }
    return value;
  }

  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (FORBIDDEN_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
        throw new AppException(
          ErrorCode.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
          `Disallowed input key "${key}" detected in ${location}.`,
        );
      }

      if (key.includes('\u0000')) {
        throw new AppException(
          ErrorCode.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
          `Null byte detected in key inside ${location}.`,
        );
      }

      value[key] = sanitizeValue(value[key], `${location}.${key}`, depth + 1);
    }
    return value;
  }

  return value;
}

@Injectable()
export class SecuritySanitizeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecuritySanitizeMiddleware.name);

  use(request: Request, _response: Response, next: NextFunction): void {
    try {
      if (request.body !== undefined && request.body !== null) {
        sanitizeValue(request.body, 'body', 0);
      }
      if (request.params && typeof request.params === 'object') {
        sanitizeValue(request.params, 'params', 0);
      }
      if (request.query && typeof request.query === 'object') {
        sanitizeValue(request.query, 'query', 0);
      }
      next();
    } catch (error) {
      if (error instanceof AppException) {
        this.logger.warn(
          `Blocked suspicious input on ${request.method} ${request.originalUrl}: ${error.message}`,
        );
      }
      next(error);
    }
  }
}
