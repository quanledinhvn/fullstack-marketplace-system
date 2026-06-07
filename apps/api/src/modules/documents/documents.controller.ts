import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { User } from '@prisma/client';
import type { TApiResponse, TDocumentResponse } from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DocumentsService } from './documents.service';
import { DocumentQueryDto } from './dto/document-query.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
@Roles('seller')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async upload(
    @CurrentUser() user: User,
    @Body() dto: UploadDocumentDto,
  ): Promise<TApiResponse<TDocumentResponse>> {
    this.logger.log(`[POST /documents] userId=${user.id} fileName=${dto.fileName}`);
    const doc = await this.documentsService.upload(user.id, dto);
    return { success: true, data: plainToInstance(DocumentResponseDto, doc, { excludeExtraneousValues: true }) };
  }

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query() query: DocumentQueryDto,
  ): Promise<TApiResponse<TDocumentResponse[]>> {
    this.logger.log(`[GET /documents] userId=${user.id} query=${JSON.stringify(query)}`);
    const docs = await this.documentsService.list(user.id, query);
    return {
      success: true,
      data: docs.map((doc) => plainToInstance(DocumentResponseDto, doc, { excludeExtraneousValues: true })),
    };
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<TApiResponse<TDocumentResponse>> {
    this.logger.log(`[GET /documents/:id] userId=${user.id} documentId=${id}`);
    const doc = await this.documentsService.findOne(user.id, id);
    return { success: true, data: plainToInstance(DocumentResponseDto, doc, { excludeExtraneousValues: true }) };
  }
}
