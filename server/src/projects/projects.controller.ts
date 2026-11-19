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
import type { Request, Response } from 'express';
import { CurrentAdmin } from '@/auth/decorators/current-admin.decorator';
import { AdminAuthGuard } from '@/auth/guards/admin-auth.guard';
import type { AdminUser } from '@/auth/interfaces/admin-user.interface';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectAuditMeta, ProjectsService } from './projects.service';

function extractAuditMeta(request: Request, response: Response): ProjectAuditMeta {
  const requestIdHeader = response.getHeader('X-Request-Id');
  const userAgentHeader = request.headers['user-agent'];
  return {
    requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
    ip: request.ip,
    userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
  };
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminAuthGuard)
  create(
    @Body() dto: CreateProjectDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.projectsService.create(
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.projectsService.update(
      id,
      dto,
      admin.email,
      extractAuditMeta(request, response),
    );
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.projectsService.remove(
      id,
      admin.email,
      extractAuditMeta(request, response),
    );
  }
}
