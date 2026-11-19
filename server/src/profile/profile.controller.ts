import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentAdmin } from '@/auth/decorators/current-admin.decorator';
import { AdminAuthGuard } from '@/auth/guards/admin-auth.guard';
import type { AdminUser } from '@/auth/interfaces/admin-user.interface';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { CreateAchievementDto, UpdateAchievementDto } from './dto/achievement.dto';
import {
  CreateContactMessageDto,
  UpdateContactStatusDto,
} from './dto/contact-message.dto';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileAuditMeta, ProfileService } from './profile.service';

function extractAuditMeta(request: Request, response: Response): ProfileAuditMeta {
  const requestIdHeader = response.getHeader('X-Request-Id');
  const userAgentHeader = request.headers['user-agent'];
  return {
    requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
    ip: request.ip,
    userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
  };
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getPublicProfile() {
    return this.profileService.getPublicProfile();
  }

  @Get('full')
  getFullAbout() {
    return this.profileService.getFullAbout();
  }

  @Patch()
  @UseGuards(AdminAuthGuard)
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.upsertProfile(dto, admin.email, extractAuditMeta(request, response));
  }

  // --- Skills ---
  @Get('skills')
  findAllSkills() {
    return this.profileService.findAllSkills();
  }

  @Post('skills')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminAuthGuard)
  createSkill(
    @Body() dto: CreateSkillDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.createSkill(dto, admin.email, extractAuditMeta(request, response));
  }

  @Patch('skills/:id')
  @UseGuards(AdminAuthGuard)
  updateSkill(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSkillDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.updateSkill(id, dto, admin.email, extractAuditMeta(request, response));
  }

  @Delete('skills/:id')
  @UseGuards(AdminAuthGuard)
  removeSkill(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.removeSkill(id, admin.email, extractAuditMeta(request, response));
  }

  // --- Experiences ---
  @Get('experiences')
  findAllExperiences() {
    return this.profileService.findAllExperiences();
  }

  @Post('experiences')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminAuthGuard)
  createExperience(
    @Body() dto: CreateExperienceDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.createExperience(dto, admin.email, extractAuditMeta(request, response));
  }

  @Patch('experiences/:id')
  @UseGuards(AdminAuthGuard)
  updateExperience(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateExperienceDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.updateExperience(id, dto, admin.email, extractAuditMeta(request, response));
  }

  @Delete('experiences/:id')
  @UseGuards(AdminAuthGuard)
  removeExperience(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.removeExperience(id, admin.email, extractAuditMeta(request, response));
  }

  // --- Education ---
  @Get('education')
  findAllEducation() {
    return this.profileService.findAllEducation();
  }

  @Post('education')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminAuthGuard)
  createEducation(
    @Body() dto: CreateEducationDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.createEducation(dto, admin.email, extractAuditMeta(request, response));
  }

  @Patch('education/:id')
  @UseGuards(AdminAuthGuard)
  updateEducation(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateEducationDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.updateEducation(id, dto, admin.email, extractAuditMeta(request, response));
  }

  @Delete('education/:id')
  @UseGuards(AdminAuthGuard)
  removeEducation(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.removeEducation(id, admin.email, extractAuditMeta(request, response));
  }

  // --- Contact Messages ---
  @Post('contact')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  submitContactMessage(
    @Body() dto: CreateContactMessageDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.submitContactMessage(dto, extractAuditMeta(request, response));
  }

  @Get('contact')
  @UseGuards(AdminAuthGuard)
  findAllContactMessages(@Query() query: PaginationQueryDto) {
    return this.profileService.findAllContactMessages(query);
  }

  @Patch('contact/:id')
  @UseGuards(AdminAuthGuard)
  updateContactMessageStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateContactStatusDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.updateContactMessageStatus(
      id,
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Delete('contact/:id')
  @UseGuards(AdminAuthGuard)
  removeContactMessage(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.removeContactMessage(
      id,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  // --- Achievements ---
  @Get('achievements')
  findAllAchievements() {
    return this.profileService.findAllAchievements();
  }

  @Get('achievements/slug/:slug')
  findAchievementBySlug(@Param('slug') slug: string) {
    return this.profileService.findAchievementBySlug(slug);
  }

  @Post('achievements')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminAuthGuard)
  createAchievement(
    @Body() dto: CreateAchievementDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.createAchievement(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Patch('achievements/:id')
  @UseGuards(AdminAuthGuard)
  updateAchievement(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateAchievementDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.updateAchievement(
      id,
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Delete('achievements/:id')
  @UseGuards(AdminAuthGuard)
  removeAchievement(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.profileService.removeAchievement(
      id,
      admin.email,
      extractAuditMeta(request, response),
    );
  }
}
