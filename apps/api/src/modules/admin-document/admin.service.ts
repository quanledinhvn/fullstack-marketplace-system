import { Injectable } from '@nestjs/common';
import type { Document, DocumentStatus } from '@prisma/client';
import { DocumentsRepository } from '../documents/documents.repository';
import type { AdminDocumentQueryDto } from './dto/admin-document-query.dto';

@Injectable()
export class AdminService {
	constructor(private readonly repo: DocumentsRepository) {}

	async listAll(query: AdminDocumentQueryDto): Promise<Document[]> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;

		return this.repo.findAll({
			status: query.status as DocumentStatus | undefined,
			skip: (page - 1) * limit,
			take: limit,
		});
	}
}
