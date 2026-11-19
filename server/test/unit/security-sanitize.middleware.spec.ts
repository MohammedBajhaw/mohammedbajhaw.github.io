import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Request, Response } from 'express';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import { SecuritySanitizeMiddleware } from '@/common/middleware/security-sanitize.middleware';

function runSanitize(input: {
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, string>;
}): { nextError?: unknown } {
  const middleware = new SecuritySanitizeMiddleware();
  const req = {
    method: 'POST',
    originalUrl: '/api/test',
    body: input.body ?? {},
    query: input.query ?? {},
    params: input.params ?? {},
  } as unknown as Request;
  const res = {} as Response;
  let capturedError: unknown;

  middleware.use(req, res, (err?: unknown) => {
    capturedError = err;
  });

  return { nextError: capturedError };
}

describe('SecuritySanitizeMiddleware (Unit)', () => {
  it('allows clean payloads and strips invisible control characters', () => {
    const body = { title: 'Hello\u0007 World\nLine2' };
    const { nextError } = runSanitize({ body });
    assert.equal(nextError, undefined);
    assert.equal(body.title, 'Hello World\nLine2');
  });

  it('blocks MongoDB operator keys starting with $', () => {
    const { nextError } = runSanitize({
      body: { email: { $ne: '' } },
    });
    assert.ok(nextError instanceof AppException);
    assert.equal(nextError.code, ErrorCode.BAD_REQUEST);
  });

  it('blocks dotted keys in body or query', () => {
    const { nextError } = runSanitize({
      query: { 'profile.role': 'admin' },
    });
    assert.ok(nextError instanceof AppException);
    assert.equal(nextError.code, ErrorCode.BAD_REQUEST);
  });

  it('blocks prototype pollution keys using JSON.parse', () => {
    const malicious = JSON.parse('{"__proto__": {"polluted": true}}') as unknown;
    const { nextError } = runSanitize({ body: malicious });
    assert.ok(nextError instanceof AppException);
    assert.equal(nextError.code, ErrorCode.BAD_REQUEST);
  });

  it('blocks null bytes in string values', () => {
    const { nextError } = runSanitize({
      body: { name: 'file.png\u0000.exe' },
    });
    assert.ok(nextError instanceof AppException);
    assert.equal(nextError.code, ErrorCode.BAD_REQUEST);
  });
});
