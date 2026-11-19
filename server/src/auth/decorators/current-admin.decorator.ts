import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import type { AdminUser, AuthenticatedRequest } from '../interfaces/admin-user.interface';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AdminUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.adminUser) {
      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
        'Authenticated admin context is missing.',
      );
    }
    return request.adminUser;
  },
);
