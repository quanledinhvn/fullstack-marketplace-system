import { ArgumentsHost, Catch, ExceptionFilter, Inject, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
	AppException,
	AppExceptionResponse,
	AppInternalServerError,
	AppNotRouteFoundError,
} from '../exceptions/exception';

@Catch()
export class GlobalHandleExceptionFilter implements ExceptionFilter {
	constructor(
		@Inject(WINSTON_MODULE_PROVIDER)
		private readonly logger: Logger,
	) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const req = ctx.getRequest<Request>();
		const res = ctx.getResponse<Response>();

		let appException: AppException;
		let extraData: unknown;

		if (exception instanceof AppException) {
			appException = exception;
		} else if (exception instanceof NotFoundException) {
			appException = new AppNotRouteFoundError();
		} else {
			const stack = exception instanceof Error ? exception.stack : String(exception);

			extraData = process.env.ENABLE_VERBOSE_ERR_RESPONSE === 'true' ? stack : undefined;

			appException = new AppInternalServerError();
		}

		const body = appException.getResponse() as AppExceptionResponse;
		const status = appException.getStatus();

		const logPayload = {
			error:
				exception instanceof Error
					? { message: exception.message, stack: exception.stack }
					: String(exception),
			http: { status, method: req.method, url: req.url },
		};

		if (status >= 500) {
			this.logger.error('Request failed', logPayload);
		} else {
			this.logger.warn('Request rejected', logPayload);
		}

		const responseBody: AppExceptionResponse =
			extraData !== undefined ? { ...body, data: extraData } : body;

		res.status(status).json(responseBody);
	}
}
