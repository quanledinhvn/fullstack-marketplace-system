import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ActionType, ActorType, DocumentStatus } from '@prisma/client';
import { VERIFICATION_QUEUE } from '../../queue/queue.constants';
import { DocumentsRepository } from '../documents/documents.repository';
import { RateLimitError, VerificationService } from './verification.service';

@Processor(VERIFICATION_QUEUE, {
	limiter: { max: 100, duration: 60_000 },
})
export class VerificationConsumer extends WorkerHost {
	private readonly logger = new Logger(VerificationConsumer.name);

	constructor(
		private readonly verificationService: VerificationService,
		private readonly repo: DocumentsRepository,
	) {
		super();
	}

	async process(job: Job<{ documentId: string }>, token?: string): Promise<void> {
		const { documentId } = job.data;

		this.logger.log(
			`[process] jobId=${job.id} documentId=${documentId} attempt=${job.attemptsMade + 1}`,
		);

		const doc = await this.repo.findById(documentId);

		if (!doc || doc.status !== DocumentStatus.PROCESSING) {
			this.logger.warn(
				`[process] skip jobId=${job.id} documentId=${documentId} status=${doc?.status ?? 'not_found'}`,
			);

			return;
		}

		try {
			const { verificationId } = await this.verificationService.callMockService(documentId);

			await this.repo.updateStatus(documentId, { verificationId });

			this.logger.log(
				`[process] submitted jobId=${job.id} documentId=${documentId} verificationId=${verificationId}`,
			);
		} catch (err) {
			if (err instanceof RateLimitError) {
				this.logger.warn(
					`[process] rate-limited jobId=${job.id} documentId=${documentId}, delayed 60s`,
				);

				await job.moveToDelayed(Date.now() + 60_000, token);

				return;
			}

			this.logger.error(`[process] error jobId=${job.id} documentId=${documentId}`, err);

			throw err;
		}
	}

	@OnWorkerEvent('failed')
	async onFailed(job: Job<{ documentId: string }>, err: Error): Promise<void> {
		const maxAttempts = job.opts?.attempts ?? 4;

		this.logger.error(
			`[failed] jobId=${job.id} documentId=${job.data.documentId} attempt=${job.attemptsMade}/${maxAttempts} err=${err.message}`,
		);

		if ((job.attemptsMade ?? 0) < maxAttempts) return;

		const { documentId } = job.data;
		const doc = await this.repo.findById(documentId);
		const prevStatus = doc?.status ?? DocumentStatus.PROCESSING;

		await this.repo.updateStatus(documentId, { status: DocumentStatus.ERROR });

		await this.repo.createAuditLog({
			documentId,
			actionType: ActionType.AUTO,
			actorType: ActorType.SYSTEM,
			prevStatus: String(prevStatus),
			nextStatus: DocumentStatus.ERROR,
		});

		this.logger.log(`[failed] marked ERROR documentId=${documentId}`);
	}
}
