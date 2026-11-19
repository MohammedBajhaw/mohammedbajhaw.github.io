import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { AuditService } from '@/audit/audit.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import {
  PaginatedPayload,
  buildPaginationMeta,
} from '@/common/interfaces/api-response.interface';
import type { CreateServiceAreaDto } from './dto/create-service-area.dto';
import type { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { ServiceArea, ServiceAreaDocument } from './service-area.schema';

export interface ServiceAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceArea.name)
    private readonly serviceAreaModel: Model<ServiceAreaDocument>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedPayload<ServiceArea>> {
    const filter: FilterQuery<ServiceAreaDocument> = {};

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { 'services.title': regex },
        { 'services.summary': regex },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.serviceAreaModel
        .find(filter)
        .sort({ sort_order: 1, createdAt: 1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.serviceAreaModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((doc) => doc.toJSON()),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findById(id: string): Promise<ServiceArea> {
    const area = await this.serviceAreaModel.findById(id).exec();
    if (!area) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Service area with id "${id}" was not found.`,
        { id },
      );
    }
    return area.toJSON();
  }

  async create(
    dto: CreateServiceAreaDto,
    actorEmail: string,
    meta: ServiceAuditMeta = {},
  ): Promise<ServiceArea> {
    const created = await this.serviceAreaModel.create(dto);

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'POST',
      path: '/api/services',
      statusCode: HttpStatus.CREATED,
      outcome: 'success',
      durationMs: 0,
      action: 'CREATE_SERVICE_AREA',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return created.toJSON();
  }

  async update(
    id: string,
    dto: UpdateServiceAreaDto,
    actorEmail: string,
    meta: ServiceAuditMeta = {},
  ): Promise<ServiceArea> {
    const updated = await this.serviceAreaModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Service area with id "${id}" was not found.`,
        { id },
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'PATCH',
      path: `/api/services/${id}`,
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'UPDATE_SERVICE_AREA',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return updated.toJSON();
  }

  async remove(
    id: string,
    actorEmail: string,
    meta: ServiceAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.serviceAreaModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Service area with id "${id}" was not found.`,
        { id },
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'DELETE',
      path: `/api/services/${id}`,
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'DELETE_SERVICE_AREA',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { deleted: true, id };
  }
}
