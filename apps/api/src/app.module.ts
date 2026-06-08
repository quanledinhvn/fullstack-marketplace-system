import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { logConfig } from './config/log.config';
import { GlobalHandleExceptionFilter } from './common/filters/exception.filter';
import { RolesGuard, UserIdGuard } from './common/guards';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin-document/admin.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { UsersModule } from './modules/users/users.module';
import { VerificationModule } from './modules/verification/verification.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [logConfig] }),
		WinstonModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => config.get('log')!,
			inject: [ConfigService],
		}),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				connection: {
					url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
				},
			}),
			inject: [ConfigService],
		}),
		PrismaModule,
		AuthModule,
		UsersModule,
		DocumentsModule,
		AdminModule,
		VerificationModule,
		WebhookModule,
		HealthModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: GlobalHandleExceptionFilter,
		},
		{
			provide: APP_GUARD,
			useClass: UserIdGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
