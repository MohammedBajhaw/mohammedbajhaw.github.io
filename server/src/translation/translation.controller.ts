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
import { TestTranslationDto } from './dto/test-translation.dto';
import { TranslateContentDto } from './dto/translate-content.dto';
import { UpdateTranslationSettingsDto } from './dto/update-translation-settings.dto';
import { type TranslationAuditMeta, TranslationService } from './translation.service';

function extractAuditMeta(request: Request, response: Response): TranslationAuditMeta {
  const requestIdHeader = response.getHeader('X-Request-Id');
  const userAgentHeader = request.headers['user-agent'];
  return {
    requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
    ip: request.ip,
    userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
  };
}

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('languages')
  getSupportedLanguages() {
    return this.translationService.getSupportedLanguages();
  }

  @Get('settings')
  @UseGuards(AdminAuthGuard)
  getSettings() {
    return this.translationService.getSettings();
  }

  @Patch('settings')
  @UseGuards(AdminAuthGuard)
  updateSettings(
    @Body() dto: UpdateTranslationSettingsDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.translationService.updateSettings(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  testConnection(
    @Body() dto: TestTranslationDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.translationService.testConnection(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  translate(
    @Body() dto: TranslateContentDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.translationService.translate(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }
}
