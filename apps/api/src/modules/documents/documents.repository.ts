import { Injectable } from '@nestjs/common';
import type { ActionType, ActorType, Document } from '@prisma/client';
import { DocumentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DocumentsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: {
		userId: string;
		fileName: string;
		fileSize: number;
		fileUrl: string;
		status?: DocumentStatus;
	}): Promise<Document> {
		return this.prisma.document.create({ data });
	}

	async findAllByUser(
		userId: string,
		opts: { status?: DocumentStatus; skip: number; take: number },
	): Promise<Document[]> {
		return this.prisma.document.findMany({
			where: { userId, ...(opts.status ? { status: opts.status } : {}) },
			orderBy: { createdAt: 'desc' },
			skip: opts.skip,
			take: opts.take,
		});
	}

	async findById(id: string): Promise<Document | null> {
		return this.prisma.document.findUnique({ where: { id } });
	}

	async updateJobId(id: string, jobId: string): Promise<Document> {
		return this.prisma.document.update({ where: { id }, data: { jobId } });
	}

	async updateStatus(
		id: string,
		data: { status?: DocumentStatus; verificationId?: string },
	): Promise<Document> {
		return this.prisma.document.update({ where: { id }, data });
	}

	async findByVerificationId(verificationId: string): Promise<Document | null> {
		return this.prisma.document.findFirst({ where: { verificationId } });
	}

	async findAll(opts: {
		status?: DocumentStatus;
		skip: number;
		take: number;
	}): Promise<(Document & { sellerEmail: string })[]> {
		const docs = await this.prisma.document.findMany({
			where: opts.status ? { status: opts.status } : {},
			orderBy: { createdAt: 'desc' },
			skip: opts.skip,
			take: opts.take,
			include: { user: { select: { email: true } } },
		});

		return docs.map(({ user, ...doc }) => ({ ...doc, sellerEmail: user.email }));
	}

	async findAuditLogs(documentId: string) {
		return this.prisma.auditLog.findMany({
			where: { documentId },
			orderBy: { createdAt: 'asc' },
		});
	}

	async createAuditLog(data: {
		documentId: string;
		actionType: ActionType;
		actorType: ActorType;
		actorId?: string;
		prevStatus?: string;
		nextStatus: string;
		reason?: string;
	}): Promise<void> {
		await this.prisma.auditLog.create({ data });
	}
}
