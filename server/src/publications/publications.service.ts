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
import type { CreatePublicationDto } from './dto/create-publication.dto';
import type { UpdatePublicationDto } from './dto/update-publication.dto';
import { Publication, PublicationDocument } from './publication.schema';

export interface PublicationAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel(Publication.name)
    private readonly publicationModel: Model<PublicationDocument>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedPayload<Publication>> {
    const filter: FilterQuery<PublicationDocument> = {};

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { venue: regex },
        { summary: regex },
        { keywords: regex },
        { doi: regex },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.publicationModel
        .find(filter)
        .sort({ sort_order: 1, createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.publicationModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((doc) => doc.toJSON()),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findById(id: string): Promise<Publication> {
    const publication = await this.publicationModel.findById(id).exec();
    if (!publication) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Publication with id "${id}" was not found.`,
        { id },
      );
    }
    return publication.toJSON();
  }

  async create(
    dto: CreatePublicationDto,
    actorEmail: string,
    meta: PublicationAuditMeta = {},
  ): Promise<Publication> {
    const created = await this.publicationModel.create(dto);

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'POST',
      path: '/api/publications',
      statusCode: HttpStatus.CREATED,
      outcome: 'success',
      durationMs: 0,
      action: 'CREATE_PUBLICATION',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return created.toJSON();
  }

  async update(
    id: string,
    dto: UpdatePublicationDto,
    actorEmail: string,
    meta: PublicationAuditMeta = {},
  ): Promise<Publication> {
    const updated = await this.publicationModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Publication with id "${id}" was not found.`,
        { id },
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'PATCH',
      path: `/api/publications/${id}`,
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'UPDATE_PUBLICATION',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return updated.toJSON();
  }

  async remove(
    id: string,
    actorEmail: string,
    meta: PublicationAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.publicationModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Publication with id "${id}" was not found.`,
        { id },
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'DELETE',
      path: `/api/publications/${id}`,
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'DELETE_PUBLICATION',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { deleted: true, id };
  }
}
