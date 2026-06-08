import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../database/prisma.module';
import { VERIFICATION_QUEUE } from '../../queue/queue.constants';
import { QueueModule } from '../../queue/queue.module';
import { DocumentsController } from './documents.controller';
import { DocumentsRepository } from './documents.repository';
import { DocumentsService } from './documents.service';

@Module({
	imports: [PrismaModule, QueueModule, BullModule.registerQueue({ name: VERIFICATION_QUEUE })],
	controllers: [DocumentsController],
	providers: [DocumentsService, DocumentsRepository],
	exports: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
