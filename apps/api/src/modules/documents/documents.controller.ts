import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DocumentsService } from './documents.service';
import { DocumentQueryDto } from './dto/document-query.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
@Roles('seller')
export class DocumentsController {
	private readonly logger = new Logger(DocumentsController.name);

	constructor(private readonly documentsService: DocumentsService) {}

	@Post()
	upload(@CurrentUser() user: User, @Body() dto: UploadDocumentDto) {
		this.logger.log(`[POST /documents] userId=${user.id} fileName=${dto.fileName}`);
		return this.documentsService.upload(user.id, dto);
	}

	@Get()
	list(@CurrentUser() user: User, @Query() query: DocumentQueryDto) {
		this.logger.log(`[GET /documents] userId=${user.id} query=${JSON.stringify(query)}`);
		return this.documentsService.list(user.id, query);
	}

	@Get(':id')
	findOne(@CurrentUser() user: User, @Param('id') id: string) {
		this.logger.log(`[GET /documents/:id] userId=${user.id} documentId=${id}`);
		return this.documentsService.findOne(user.id, id);
	}
}
