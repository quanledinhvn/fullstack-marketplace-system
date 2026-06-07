import { Controller, Get, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { TAdminDocumentResponse, TApiResponse } from '@app/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminDocumentResponseDto } from './dto/admin-document-response.dto';
import { AdminDocumentQueryDto } from './dto/admin-document-query.dto';

@Controller('admin/documents')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listAll(
    @Query() query: AdminDocumentQueryDto,
  ): Promise<TApiResponse<TAdminDocumentResponse[]>> {
    const docs = await this.adminService.listAll(query);
    return {
      success: true,
      data: docs.map((doc) => plainToInstance(AdminDocumentResponseDto, doc, { excludeExtraneousValues: true })),
    };
  }
}
