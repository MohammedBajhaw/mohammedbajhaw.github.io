import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { EnvConfig } from '@/common/config/env.validation';
import { ADMIN_COOKIE_NAME } from './auth.constants';
import { AuthService } from './auth.service';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { LoginDto } from './dto/login.dto';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import type { AdminUser } from './interfaces/admin-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestIdHeader = response.getHeader('X-Request-Id');
    const userAgentHeader = request.headers['user-agent'];

    const result = await this.authService.login(dto, {
      requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
      ip: request.ip,
      userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
    });

    const isProd = this.config.get('NODE_ENV', { infer: true }) === 'production';

    response.cookie(ADMIN_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminAuthGuard)
  async logout(
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestIdHeader = response.getHeader('X-Request-Id');
    const userAgentHeader = request.headers['user-agent'];
    const isProd = this.config.get('NODE_ENV', { infer: true }) === 'production';

    response.clearCookie(ADMIN_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
    });

    return this.authService.logout(admin, {
      requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
      ip: request.ip,
      userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
    });
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  me(@CurrentAdmin() admin: AdminUser) {
    return {
      email: admin.email,
      role: admin.role,
      authenticated: true,
    };
  }
}
