import { AppModule } from '../src/app.module';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';

export interface ITestContext {
	app: INestApplication;
	module: TestingModule;
}

declare global {
	var testContext: ITestContext;
}

beforeAll(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	const testApp: INestApplication = moduleFixture.createNestApplication();

	testApp.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	testApp.setGlobalPrefix('api');

	await testApp.init();

	await testApp.listen(0);

	useContainer(testApp.select(AppModule), {
		fallbackOnErrors: true,
	});

	global.testContext = {
		app: testApp,
		module: moduleFixture,
	};
});

afterAll(async () => {
	if (global.testContext) {
		await global.testContext.app.close();
	}
});
