import { Inject } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { UnrecoverableError } from 'bullmq';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AppException } from '../common/exceptions/exception';

export abstract class BaseProcessor<T = unknown, R = unknown> extends WorkerHost {
	constructor(@Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger) {
		super();
	}

	async process(job: Job<T>): Promise<R> {
		const traceId = crypto.randomUUID();
		const start = Date.now();

		this.logger.info('Starting job', {
			traceId,
			jobId: job.id,
			jobName: job.name,
			attempt: job.attemptsMade + 1,
		});

		try {
			const result = await this.execute(job, traceId);

			this.logger.info('Completed job', {
				traceId,
				jobId: job.id,
				jobName: job.name,
				durationMs: Date.now() - start,
			});

			return result;
		} catch (err) {
			this.handleError(err, { traceId, jobId: job.id, jobName: job.name });
		}
	}

	protected abstract execute(job: Job<T>, traceId: string): Promise<R>;

	private handleError(
		err: unknown,
		meta: { traceId: string; jobId: string | undefined; jobName: string },
	): never {
		if (err instanceof AppException && err.getStatus() < 500) {
			const message = err.message;
			this.logger.warn('Job failed with business error (no retry)', {
				...meta,
				error: message,
				status: err.getStatus(),
			});
			throw new UnrecoverableError(message);
		}

		this.logger.error('Job failed with system error (will retry)', {
			...meta,
			error: err instanceof Error ? err.message : String(err),
		});
		throw err;
	}
}
