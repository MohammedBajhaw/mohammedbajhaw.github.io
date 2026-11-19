import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { EnvConfig } from '@/common/config/env.validation';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import { ADMIN_COOKIE_NAME } from '../auth.constants';
import { AuthService } from '../auth.service';
import type { AdminUser, AuthenticatedRequest } from '../interfaces/admin-user.interface';

function extractToken(request: AuthenticatedRequest): string | undefined {
  const cookies = request.cookies as Record<string, unknown> | undefined;
  const cookieToken = cookies?.[ADMIN_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.trim().length > 0) {
    return cookieToken.trim();
  }

  const authHeader = request.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer.length > 0) {
      return bearer;
    }
  }

  return undefined;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractToken(request);

    if (!token) {
      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
        'Dashboard authentication is required.',
      );
    }

    let payload: AdminUser;
    try {
      payload = await this.jwtService.verifyAsync<AdminUser>(token, {
        secret: this.config.get('JWT_SECRET', { infer: true }),
      });
    } catch {
      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
        'Invalid or expired authentication session.',
      );
    }

    const configuredAdminEmail = this.config
      .get('ADMIN_EMAIL', { infer: true })
      .toLowerCase();

    if (
      payload.sub !== 'owner' ||
      payload.role !== 'admin' ||
      !payload.jti ||
      payload.email.toLowerCase() !== configuredAdminEmail
    ) {
      throw new AppException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'Access restricted to the platform owner.',
      );
    }

    const revoked = await this.authService.isTokenRevoked(payload.jti);
    if (revoked) {
      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
        'Session has been logged out. Please sign in again.',
      );
    }

    request.adminUser = payload;
    return true;
  }
}
