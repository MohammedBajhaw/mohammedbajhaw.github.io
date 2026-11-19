import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '@/auth/guards/admin-auth.guard';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { AuditService } from './audit.service';

@Controller('audit-logs')
@UseGuards(AdminAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.auditService.findAll(query);
  }
}
