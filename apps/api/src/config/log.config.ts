import { registerAs } from '@nestjs/config';
import * as winston from 'winston';
import type { WinstonModuleOptions } from 'nest-winston';

export const logConfig = registerAs(
	'log',
	(): WinstonModuleOptions => ({
		transports: [
			new winston.transports.Console({
				format:
					process.env.NODE_ENV === 'production'
						? winston.format.combine(winston.format.timestamp(), winston.format.json())
						: winston.format.combine(winston.format.colorize(), winston.format.simple()),
			}),
		],
	}),
);
