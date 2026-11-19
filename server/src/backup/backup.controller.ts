import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentAdmin } from '@/auth/decorators/current-admin.decorator';
import { AdminAuthGuard } from '@/auth/guards/admin-auth.guard';
import type { AdminUser } from '@/auth/interfaces/admin-user.interface';
import { type BackupAuditMeta, BackupService } from './backup.service';
import { UpdateBackupSettingsDto } from './dto/update-backup-settings.dto';

function extractAuditMeta(request: Request, response: Response): BackupAuditMeta {
  const requestIdHeader = response.getHeader('X-Request-Id');
  const userAgentHeader = request.headers['user-agent'];
  return {
    requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
    ip: request.ip,
    userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
  };
}

@Controller('backup')
@UseGuards(AdminAuthGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('settings')
  getSettings() {
    return this.backupService.getSettings();
  }

  @Patch('settings')
  updateSettings(
    @Body() dto: UpdateBackupSettingsDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.backupService.updateSettings(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Get('export')
  exportSnapshot(
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.backupService.exportSnapshot(
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  runRemoteBackup(
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.backupService.runRemoteBackup(
      admin.email,
      extractAuditMeta(request, response),
    );
  }
}
