import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import type { AuditService } from '@/audit/audit.service';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import { UploadsService } from '@/uploads/uploads.service';

describe('UploadsService (Unit)', () => {
  let tempDir = '';
  const auditEvents: string[] = [];

  const mockAuditService = {
    record: (entry: { action?: string }) => {
      if (entry.action) {
        auditEvents.push(entry.action);
      }
      return Promise.resolve();
    },
  } as unknown as AuditService;

  const service = new UploadsService(mockAuditService);

  before(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'bajhaw-upload-test-'));
  });

  after(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('accepts a valid PNG file matching magic bytes', async () => {
    const filePath = join(tempDir, 'valid.png');
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    await writeFile(filePath, pngBytes);

    const file = {
      filename: 'valid.png',
      originalname: 'avatar.png',
      mimetype: 'image/png',
      size: pngBytes.length,
      path: filePath,
    } as Express.Multer.File;

    const result = await service.recordUploadedFile(file, 'admin@example.com');
    assert.equal(result.category, 'images');
    assert.equal(result.url, '/uploads/images/valid.png');
    assert.ok(auditEvents.includes('UPLOAD_FILE'));
  });

  it('rejects and deletes a spoofed HTML file disguised as PNG', async () => {
    const filePath = join(tempDir, 'spoof.png');
    await writeFile(filePath, '<html><script>alert(1)</script></html>', 'utf8');

    const file = {
      filename: 'spoof.png',
      originalname: 'evil.png',
      mimetype: 'image/png',
      size: 38,
      path: filePath,
    } as Express.Multer.File;

    await assert.rejects(
      () => service.recordUploadedFile(file, 'admin@example.com'),
      (err: unknown) => err instanceof AppException && err.code === ErrorCode.BAD_REQUEST,
    );

    assert.equal(existsSync(filePath), false);
    assert.ok(auditEvents.includes('UPLOAD_REJECTED_SIGNATURE'));
  });

  it('blocks path traversal attempts in removeFile', async () => {
    await assert.rejects(
      () => service.removeFile('images', '../.env', 'admin@example.com'),
      (err: unknown) => err instanceof AppException && err.code === ErrorCode.BAD_REQUEST,
    );
  });
});
