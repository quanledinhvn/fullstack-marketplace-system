import { Injectable, Logger } from '@nestjs/common';
import { AppNotFoundException, AppNotAllowedException } from '../../common/exceptions';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DocumentStatus } from '@prisma/client';
import type { Document } from '@prisma/client';
import { VERIFICATION_QUEUE } from '../../queue/queue.constants';
import { DocumentsRepository } from './documents.repository';
import type { UploadDocumentDto } from './dto/upload-document.dto';
import type { DocumentQueryDto } from './dto/document-query.dto';

@Injectable()
export class DocumentsService {
	private readonly logger = new Logger(DocumentsService.name);

	constructor(
		private readonly repo: DocumentsRepository,
		@InjectQueue(VERIFICATION_QUEUE) private readonly verificationQueue: Queue,
	) {}

	async upload(userId: string, dto: UploadDocumentDto): Promise<Document> {
		const doc = await this.repo.create({
			userId,
			fileName: dto.fileName,
			fileSize: dto.fileSize,
			fileUrl: `stub://${dto.fileName}`,
			status: DocumentStatus.PROCESSING,
		});

		this.logger.log(`[publish] verify job documentId=${doc.id} userId=${userId}`);

		const job = await this.verificationQueue.add(
			'verify',
			{ documentId: doc.id },
			{
				attempts: 4,
				backoff: { type: 'exponential', delay: 30_000 },
			},
		);

		this.logger.log(`[published] jobId=${job.id} documentId=${doc.id}`);

		await this.repo.updateJobId(doc.id, String(job.id));

		return { ...doc, jobId: String(job.id) };
	}

	async list(userId: string, query: DocumentQueryDto): Promise<Document[]> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;

		return this.repo.findAllByUser(userId, {
			status: query.status as DocumentStatus | undefined,
			skip: (page - 1) * limit,
			take: limit,
		});
	}

	async findOne(userId: string, id: string): Promise<Document> {
		const doc = await this.repo.findById(id);

		if (!doc) throw new AppNotFoundException('Document not found');

		if (doc.userId !== userId) throw new AppNotAllowedException('Access denied');

		return doc;
	}
}
