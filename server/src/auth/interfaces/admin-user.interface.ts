import type { Request } from 'express';

export interface AdminUser {
  sub: 'owner';
  email: string;
  role: 'admin';
  jti: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminUser;
}
