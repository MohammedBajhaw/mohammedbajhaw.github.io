import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { AuditService } from '@/audit/audit.service';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import {
  PaginatedPayload,
  buildPaginationMeta,
} from '@/common/interfaces/api-response.interface';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { ProjectQueryDto } from './dto/project-query.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './project.schema';

export interface ProjectAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: ProjectQueryDto): Promise<PaginatedPayload<Project>> {
    const filter: FilterQuery<ProjectDocument> = {};

    if (query.featured !== undefined) {
      filter.featured = query.featured;
    }

    if (query.tag) {
      const escapedTag = query.tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.tags = new RegExp(`^${escapedTag}$`, 'i');
    }

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { subtitle: regex },
        { summary: regex },
        { tags: regex },
        { tools: regex },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ sort_order: 1, createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((doc) => doc.toJSON()),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findBySlug(slug: string): Promise<Project> {
    const normalizedSlug = slug.trim().toLowerCase();
    const project = await this.projectModel
      .findOne({ slug: normalizedSlug })
      .exec();

    if (!project) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Project with slug "${normalizedSlug}" was not found.`,
        { slug: normalizedSlug },
      );
    }

    return project.toJSON();
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Project with id "${id}" was not found.`,
        { id },
      );
    }
    return project.toJSON();
  }

  async create(
    dto: CreateProjectDto,
    actorEmail: string,
    meta: ProjectAuditMeta = {},
  ): Promise<Project> {
    const created = await this.projectModel.create(dto);

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'POST',
      path: '/api/projects',
      statusCode: HttpStatus.CREATED,
      outcome: 'success',
      durationMs: 0,
      action: 'CREATE_PROJECT',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return created.toJSON();
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    actorEmail: string,
    meta: ProjectAuditMeta = {},
  ): Promise<Project> {
    const updated = await this.projectModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Project with id "${id}" was not found.`,
        { id },
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'PATCH',
      path: `/api/projects/${id}`,
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'UPDATE_PROJECT',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return updated.toJSON();
  }

  async remove(
    id: string,
    actorEmail: string,
    meta: ProjectAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.projectModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Project with id "${id}" was not found.`,
        { id },
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'DELETE',
      path: `/api/projects/${id}`,
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'DELETE_PROJECT',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { deleted: true, id };
  }
}
