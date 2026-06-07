import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

interface HealthResponse {
	status: string;
	uptimeSeconds: number;
	timestamp: string;
}

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
