import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ApiInfo {
	name: string;
	version: string;
	environment: string;
}

interface GreetingResponse {
	message: string;
}

@Injectable()
export class AppService {
	constructor(private readonly configService: ConfigService) {}

	getInfo(): ApiInfo {
		return {
			name: '@app/api',
			version: '0.1.0',
			environment: this.configService.get<string>('NODE_ENV', 'development'),
		};
	}

	greet(name: string): GreetingResponse {
		return { message: `Hello, ${name}!` };
	}
}
