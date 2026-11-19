import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { AppException } from '../errors/app.exception';
import { ErrorCode } from '../errors/error-codes';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new AppException(
        ErrorCode.INVALID_IDENTIFIER,
        HttpStatus.BAD_REQUEST,
        `Invalid identifier format: "${value}"`,
        { value },
      );
    }
    return value;
  }
}
