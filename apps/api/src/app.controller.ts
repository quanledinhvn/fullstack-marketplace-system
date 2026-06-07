import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateGreetingDto } from './dto/create-greeting.dto';

interface ApiInfo {
	name: string;
	version: string;
	environment: string;
}

interface GreetingResponse {
	message: string;
}

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getInfo(): ApiInfo {
		return this.appService.getInfo();
	}

	@Post('greeting')
	createGreeting(@Body() createGreetingDto: CreateGreetingDto): GreetingResponse {
		return this.appService.greet(createGreetingDto.name);
	}
}
