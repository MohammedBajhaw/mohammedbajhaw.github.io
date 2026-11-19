import { Body, Controller, Get, Patch, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentAdmin } from '@/auth/decorators/current-admin.decorator';
import { AdminAuthGuard } from '@/auth/guards/admin-auth.guard';
import type { AdminUser } from '@/auth/interfaces/admin-user.interface';
import {
  ToggleMaintenanceDto,
  UpdatePlatformSettingsDto,
} from './dto/update-platform-settings.dto';
import { type SettingsAuditMeta, SettingsService } from './settings.service';

function extractAuditMeta(request: Request, response: Response): SettingsAuditMeta {
  const requestIdHeader = response.getHeader('X-Request-Id');
  const userAgentHeader = request.headers['user-agent'];
  return {
    requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
    ip: request.ip,
    userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
  };
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Get('maintenance')
  getMaintenanceStatus() {
    return this.settingsService.getMaintenanceStatus();
  }

  @Patch()
  @UseGuards(AdminAuthGuard)
  updateSettings(
    @Body() dto: UpdatePlatformSettingsDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.settingsService.updateSettings(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Patch('maintenance')
  @UseGuards(AdminAuthGuard)
  toggleMaintenance(
    @Body() dto: ToggleMaintenanceDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.settingsService.toggleMaintenance(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }
}
