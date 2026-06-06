import type { HealthResponse } from '@app/shared';
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
	@Get()
	@Public()
	check(): HealthResponse {
		return {
			status: 'ok',
			uptimeSeconds: Math.floor(process.uptime()),
			timestamp: new Date().toISOString(),
		};
	}
}
