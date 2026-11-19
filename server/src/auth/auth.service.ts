import { randomUUID, timingSafeEqual } from 'node:crypto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { ConnectionStates, type Connection, type Model } from 'mongoose';
import { AuditService } from '@/audit/audit.service';
import type { EnvConfig } from '@/common/config/env.validation';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import type { LoginDto } from './dto/login.dto';
import type { AdminUser } from './interfaces/admin-user.interface';
import { RevokedToken, RevokedTokenDocument } from './revoked-token.schema';

export interface AuthRequestMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: string;
  user: {
    email: string;
    role: 'admin';
  };
}

function safeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    @InjectModel(RevokedToken.name)
    private readonly revokedTokenModel: Model<RevokedTokenDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async login(dto: LoginDto, meta: AuthRequestMeta = {}): Promise<LoginResult> {
    const adminEmail = this.config.get('ADMIN_EMAIL', { infer: true }).toLowerCase();
    const adminPasswordHash = this.config.get('ADMIN_PASSWORD_HASH', { infer: true });
    const adminPassword = this.config.get('ADMIN_PASSWORD', { infer: true });
    const expiresIn = this.config.get('JWT_EXPIRES_IN', { infer: true });

    const normalizedEmail = dto.email.trim().toLowerCase();
    const emailMatches = safeStringEqual(normalizedEmail, adminEmail);

    let passwordMatches = false;
    if (emailMatches) {
      if (adminPasswordHash) {
        passwordMatches = await bcrypt.compare(dto.password, adminPasswordHash);
      } else if (adminPassword) {
        passwordMatches = safeStringEqual(dto.password, adminPassword);
      }
    }

    if (!emailMatches || !passwordMatches) {
      void this.auditService.record({
        requestId: meta.requestId ?? randomUUID(),
        method: 'POST',
        path: '/api/auth/login',
        statusCode: HttpStatus.UNAUTHORIZED,
        outcome: 'error',
        durationMs: 0,
        action: 'ADMIN_LOGIN_FAILED',
        actor: normalizedEmail,
        ip: meta.ip,
        userAgent: meta.userAgent,
        errorCode: ErrorCode.UNAUTHORIZED,
        errorMessage: 'Invalid email or password',
      });

      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
        'Invalid email or password.',
      );
    }

    const payload: AdminUser = {
      sub: 'owner',
      email: adminEmail,
      role: 'admin',
      jti: randomUUID(),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'POST',
      path: '/api/auth/login',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'ADMIN_LOGIN_SUCCESS',
      actor: adminEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      expiresIn,
      user: {
        email: adminEmail,
        role: 'admin',
      },
    };
  }

  async logout(user: AdminUser, meta: AuthRequestMeta = {}): Promise<{ loggedOut: true }> {
    if (this.connection.readyState === ConnectionStates.connected && user.jti) {
      const expiresAt = user.exp
        ? new Date(user.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      try {
        await this.revokedTokenModel.updateOne(
          { jti: user.jti },
          { $setOnInsert: { jti: user.jti, expiresAt } },
          { upsert: true },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Failed to revoke token on logout: ${message}`);
      }
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'POST',
      path: '/api/auth/logout',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'ADMIN_LOGOUT',
      actor: user.email,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { loggedOut: true };
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    if (this.connection.readyState !== ConnectionStates.connected) {
      return false;
    }

    try {
      const found = await this.revokedTokenModel.exists({ jti });
      return found !== null;
    } catch {
      return false;
    }
  }
}
