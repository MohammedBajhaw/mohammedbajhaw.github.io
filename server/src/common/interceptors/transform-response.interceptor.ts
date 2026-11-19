import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiSuccessResponse,
  isPaginatedPayload,
} from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T> | ApiSuccessResponse<unknown[]>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T> | ApiSuccessResponse<unknown[]>> {
    return next.handle().pipe(
      map((payload) => {
        const timestamp = new Date().toISOString();

        if (isPaginatedPayload(payload)) {
          return {
            success: true,
            data: payload.items,
            meta: payload.meta,
            timestamp,
          };
        }

        return {
          success: true,
          data: payload,
          timestamp,
        };
      }),
    );
  }
}
