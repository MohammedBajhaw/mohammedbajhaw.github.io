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
import type { CreateAchievementDto, UpdateAchievementDto } from './dto/achievement.dto';
import type {
  CreateContactMessageDto,
  UpdateContactStatusDto,
} from './dto/contact-message.dto';
import type { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import type { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import type { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile, ProfileDocument } from './profile.schema';
import { Achievement, AchievementDocument } from './schemas/achievement.schema';
import {
  ContactMessage,
  ContactMessageDocument,
} from './schemas/contact-message.schema';
import { Education, EducationDocument } from './schemas/education.schema';
import { Experience, ExperienceDocument } from './schemas/experience.schema';
import { Skill, SkillDocument } from './schemas/skill.schema';

export interface ProfileAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface FullAboutPayload {
  profile: Profile;
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Skill.name)
    private readonly skillModel: Model<SkillDocument>,
    @InjectModel(Experience.name)
    private readonly experienceModel: Model<ExperienceDocument>,
    @InjectModel(Education.name)
    private readonly educationModel: Model<EducationDocument>,
    @InjectModel(Achievement.name)
    private readonly achievementModel: Model<AchievementDocument>,
    @InjectModel(ContactMessage.name)
    private readonly contactMessageModel: Model<ContactMessageDocument>,
    private readonly auditService: AuditService,
  ) {}

  private logAction(
    action: string,
    method: string,
    path: string,
    statusCode: number,
    actorEmail: string,
    meta: ProfileAuditMeta,
  ): void {
    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method,
      path,
      statusCode,
      outcome: 'success',
      durationMs: 0,
      action,
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  async getPublicProfile(): Promise<Profile> {
    const profile = await this.profileModel
      .findOne({ singletonKey: 'owner' })
      .exec();

    if (!profile) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Profile has not been configured yet.',
      );
    }

    return profile.toJSON();
  }

  async getFullAbout(): Promise<FullAboutPayload> {
    const [profile, skills, experiences, education] = await Promise.all([
      this.getPublicProfile(),
      this.findAllSkills(),
      this.findAllExperiences(),
      this.findAllEducation(),
    ]);

    return { profile, skills, experiences, education };
  }

  async upsertProfile(
    dto: UpdateProfileDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Profile> {
    const updated = await this.profileModel
      .findOneAndUpdate(
        { singletonKey: 'owner' },
        {
          $set: dto,
          $setOnInsert: { singletonKey: 'owner' },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      )
      .exec();

    this.logAction('UPDATE_PROFILE', 'PATCH', '/api/profile', HttpStatus.OK, actorEmail, meta);
    return updated.toJSON();
  }

  // --- Skills ---
  async findAllSkills(): Promise<Skill[]> {
    const docs = await this.skillModel
      .find()
      .sort({ sort_order: 1, createdAt: 1 })
      .exec();
    return docs.map((doc) => doc.toJSON());
  }

  async createSkill(
    dto: CreateSkillDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Skill> {
    const created = await this.skillModel.create(dto);
    this.logAction('CREATE_SKILL', 'POST', '/api/profile/skills', HttpStatus.CREATED, actorEmail, meta);
    return created.toJSON();
  }

  async updateSkill(
    id: string,
    dto: UpdateSkillDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Skill> {
    const updated = await this.skillModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Skill with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction('UPDATE_SKILL', 'PATCH', `/api/profile/skills/${id}`, HttpStatus.OK, actorEmail, meta);
    return updated.toJSON();
  }

  async removeSkill(
    id: string,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.skillModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Skill with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction('DELETE_SKILL', 'DELETE', `/api/profile/skills/${id}`, HttpStatus.OK, actorEmail, meta);
    return { deleted: true, id };
  }

  // --- Experiences ---
  async findAllExperiences(): Promise<Experience[]> {
    const docs = await this.experienceModel
      .find()
      .sort({ sort_order: 1, createdAt: -1 })
      .exec();
    return docs.map((doc) => doc.toJSON());
  }

  async createExperience(
    dto: CreateExperienceDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Experience> {
    const created = await this.experienceModel.create(dto);
    this.logAction('CREATE_EXPERIENCE', 'POST', '/api/profile/experiences', HttpStatus.CREATED, actorEmail, meta);
    return created.toJSON();
  }

  async updateExperience(
    id: string,
    dto: UpdateExperienceDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Experience> {
    const updated = await this.experienceModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Experience with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction('UPDATE_EXPERIENCE', 'PATCH', `/api/profile/experiences/${id}`, HttpStatus.OK, actorEmail, meta);
    return updated.toJSON();
  }

  async removeExperience(
    id: string,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.experienceModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Experience with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction('DELETE_EXPERIENCE', 'DELETE', `/api/profile/experiences/${id}`, HttpStatus.OK, actorEmail, meta);
    return { deleted: true, id };
  }

  // --- Education ---
  async findAllEducation(): Promise<Education[]> {
    const docs = await this.educationModel
      .find()
      .sort({ sort_order: 1, createdAt: -1 })
      .exec();
    return docs.map((doc) => doc.toJSON());
  }

  async createEducation(
    dto: CreateEducationDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Education> {
    const created = await this.educationModel.create(dto);
    this.logAction('CREATE_EDUCATION', 'POST', '/api/profile/education', HttpStatus.CREATED, actorEmail, meta);
    return created.toJSON();
  }

  async updateEducation(
    id: string,
    dto: UpdateEducationDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Education> {
    const updated = await this.educationModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Education record with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction('UPDATE_EDUCATION', 'PATCH', `/api/profile/education/${id}`, HttpStatus.OK, actorEmail, meta);
    return updated.toJSON();
  }

  async removeEducation(
    id: string,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.educationModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Education record with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction('DELETE_EDUCATION', 'DELETE', `/api/profile/education/${id}`, HttpStatus.OK, actorEmail, meta);
    return { deleted: true, id };
  }

  // --- Contact Messages ---
  async submitContactMessage(
    dto: CreateContactMessageDto,
    meta: ProfileAuditMeta = {},
  ): Promise<ContactMessage> {
    const created = await this.contactMessageModel.create({
      ...dto,
      status: 'new',
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    this.logAction(
      'CONTACT_MESSAGE_RECEIVED',
      'POST',
      '/api/profile/contact',
      HttpStatus.CREATED,
      dto.email,
      meta,
    );

    return created.toJSON();
  }

  async findAllContactMessages(
    query: PaginationQueryDto,
  ): Promise<PaginatedPayload<ContactMessage>> {
    const filter: FilterQuery<ContactMessageDocument> = {};

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { subject: regex },
        { service: regex },
        { message: regex },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.contactMessageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      this.contactMessageModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((doc) => doc.toJSON()),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async updateContactMessageStatus(
    id: string,
    dto: UpdateContactStatusDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<ContactMessage> {
    const updated = await this.contactMessageModel
      .findByIdAndUpdate(
        id,
        { $set: { status: dto.status } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Contact message with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction(
      'UPDATE_CONTACT_STATUS',
      'PATCH',
      `/api/profile/contact/${id}`,
      HttpStatus.OK,
      actorEmail,
      meta,
    );

    return updated.toJSON();
  }

  async removeContactMessage(
    id: string,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.contactMessageModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Contact message with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction(
      'DELETE_CONTACT_MESSAGE',
      'DELETE',
      `/api/profile/contact/${id}`,
      HttpStatus.OK,
      actorEmail,
      meta,
    );

    return { deleted: true, id };
  }

  // --- Achievements ---
  async findAllAchievements(): Promise<Achievement[]> {
    return this.achievementModel
      .find()
      .sort({ featured: -1, sort_order: 1, createdAt: -1 })
      .exec();
  }

  async findAchievementBySlug(slug: string): Promise<Achievement> {
    const normalizedSlug = slug.trim().toLowerCase();
    const item = await this.achievementModel.findOne({ slug: normalizedSlug }).exec();
    if (!item) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Achievement "${slug}" was not found.`,
        { slug },
      );
    }
    return item.toJSON();
  }

  async createAchievement(
    dto: CreateAchievementDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Achievement> {
    const created = await this.achievementModel.create({
      ...dto,
      slug: dto.slug.trim().toLowerCase(),
    });

    this.logAction(
      'CREATE_ACHIEVEMENT',
      'POST',
      '/api/profile/achievements',
      HttpStatus.CREATED,
      actorEmail,
      meta,
    );

    return created.toJSON();
  }

  async updateAchievement(
    id: string,
    dto: UpdateAchievementDto,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<Achievement> {
    const updateData = {
      ...dto,
      ...(dto.slug !== undefined ? { slug: dto.slug.trim().toLowerCase() } : {}),
    };

    const updated = await this.achievementModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Achievement with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction(
      'UPDATE_ACHIEVEMENT',
      'PATCH',
      `/api/profile/achievements/${id}`,
      HttpStatus.OK,
      actorEmail,
      meta,
    );

    return updated.toJSON();
  }

  async removeAchievement(
    id: string,
    actorEmail: string,
    meta: ProfileAuditMeta = {},
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await this.achievementModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new AppException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `Achievement with id "${id}" was not found.`,
        { id },
      );
    }

    this.logAction(
      'DELETE_ACHIEVEMENT',
      'DELETE',
      `/api/profile/achievements/${id}`,
      HttpStatus.OK,
      actorEmail,
      meta,
    );

    return { deleted: true, id };
  }
}
