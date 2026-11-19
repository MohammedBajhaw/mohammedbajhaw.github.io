import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException, HttpStatus, NotFoundException, type ArgumentsHost } from '@nestjs/common';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import { AllExceptionsFilter } from '@/common/filters/http-exception.filter';

interface CapturedResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

function invokeFilter(exception: unknown): CapturedResponse {
  const filter = new AllExceptionsFilter();
  let statusCode = 0;
  let body: Record<string, unknown> = {};

  const response = {
    getHeader: () => 'req-test-1234',
    status: (code: number) => {
      statusCode = code;
      return {
        json: (payload: Record<string, unknown>) => {
          body = payload;
        },
      };
    },
  };

  const request = {
    method: 'POST',
    url: '/api/test',
  };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  filter.catch(exception, host);
  return { statusCode, body };
}

describe('AllExceptionsFilter (Unit)', () => {
  it('formats AppException consistently', () => {
    const res = invokeFilter(
      new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, 'Auth required'),
    );
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    const err = res.body.error as Record<string, unknown>;
    assert.equal(err.code, ErrorCode.UNAUTHORIZED);
    assert.equal(err.message, 'Auth required');
  });

  it('maps MulterError LIMIT_FILE_SIZE to 413 FILE_TOO_LARGE', () => {
    const multerErr = Object.assign(new Error('File too large'), {
      name: 'MulterError',
      code: 'LIMIT_FILE_SIZE',
    });
    const res = invokeFilter(multerErr);
    assert.equal(res.statusCode, 413);
    const err = res.body.error as Record<string, unknown>;
    assert.equal(err.code, ErrorCode.FILE_TOO_LARGE);
  });

  it('maps Mongo duplicate key (11000) to 409 DUPLICATE_KEY', () => {
    const res = invokeFilter({ code: 11000, keyValue: { slug: 'demo' } });
    assert.equal(res.statusCode, 409);
    const err = res.body.error as Record<string, unknown>;
    assert.equal(err.code, ErrorCode.DUPLICATE_KEY);
    assert.deepEqual(err.details, { slug: 'demo' });
  });

  it('sanitizes Express default 404 Cannot GET messages', () => {
    const res = invokeFilter(new NotFoundException('Cannot GET /api/unknown'));
    assert.equal(res.statusCode, 404);
    const err = res.body.error as Record<string, unknown>;
    assert.equal(err.code, ErrorCode.RESOURCE_NOT_FOUND);
    assert.equal(err.message, 'The requested endpoint or resource was not found.');
  });

  it('extracts ValidationPipe array messages into VALIDATION_ERROR details', () => {
    const res = invokeFilter(new BadRequestException(['email must be an email']));
    assert.equal(res.statusCode, 400);
    const err = res.body.error as Record<string, unknown>;
    assert.equal(err.code, ErrorCode.VALIDATION_ERROR);
    assert.deepEqual(err.details, ['email must be an email']);
  });

  it('never leaks internal error messages on unknown 500 errors', () => {
    const res = invokeFilter(new Error('Sensitive DB connection string leaked'));
    assert.equal(res.statusCode, 500);
    const err = res.body.error as Record<string, unknown>;
    assert.equal(err.code, ErrorCode.INTERNAL_SERVER_ERROR);
    assert.ok(!String(err.message).includes('Sensitive DB'));
  });
});
