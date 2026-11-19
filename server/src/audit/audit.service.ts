import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConnectionStates, type Connection, type FilterQuery, type Model } from 'mongoose';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  PaginatedPayload,
  buildPaginationMeta,
} from '@/common/interfaces/api-response.interface';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

export interface CreateAuditLogInput {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  outcome: 'success' | 'error';
  durationMs: number;
  action?: string;
  actor?: string;
  ip?: string;
  userAgent?: string;
  errorCode?: string;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async record(entry: CreateAuditLogInput): Promise<void> {
    if (this.connection.readyState !== ConnectionStates.connected) {
      return;
    }

    try {
      await this.auditLogModel.create(entry);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to persist audit log: ${message}`);
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedPayload<AuditLog>> {
    const filter: FilterQuery<AuditLogDocument> = {};

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { path: regex },
        { action: regex },
        { requestId: regex },
        { errorCode: regex },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((doc) => doc.toJSON() as AuditLog),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }
}
