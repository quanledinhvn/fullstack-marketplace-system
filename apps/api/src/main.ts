import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');
	app.enableCors();
	app.useGlobalFilters(new AppExceptionsFilter());
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const configService = app.get(ConfigService);
	const port = configService.get<number>('PORT', 3000);

	await app.listen(port);
	Logger.log(`API ready on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
