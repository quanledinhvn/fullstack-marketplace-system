import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminDocumentQueryDto } from './dto/admin-document-query.dto';

@Controller('admin/documents')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  listAll(@Query() query: AdminDocumentQueryDto) {
    return this.adminService.listAll(query);
  }
}
