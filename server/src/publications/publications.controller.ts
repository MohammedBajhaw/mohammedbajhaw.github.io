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
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsService } from './publications.service';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.publicationsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.publicationsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminAuthGuard)
  create(
    @Body() dto: CreatePublicationDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestIdHeader = response.getHeader('X-Request-Id');
    const userAgentHeader = request.headers['user-agent'];

    return this.publicationsService.create(dto, admin.email, {
      requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
      ip: request.ip,
      userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
    });
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdatePublicationDto,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestIdHeader = response.getHeader('X-Request-Id');
    const userAgentHeader = request.headers['user-agent'];

    return this.publicationsService.update(id, dto, admin.email, {
      requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
      ip: request.ip,
      userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
    });
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentAdmin() admin: AdminUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestIdHeader = response.getHeader('X-Request-Id');
    const userAgentHeader = request.headers['user-agent'];

    return this.publicationsService.remove(id, admin.email, {
      requestId: typeof requestIdHeader === 'string' ? requestIdHeader : undefined,
      ip: request.ip,
      userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : undefined,
    });
  }
}
