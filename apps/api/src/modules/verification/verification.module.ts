import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../database/prisma.module';
import { VERIFICATION_QUEUE } from '../../queue/queue.constants';
import { DocumentsModule } from '../documents/documents.module';
import { VerificationConsumer } from './verification.consumer';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    DocumentsModule,
    HttpModule,
    BullModule.registerQueue({ name: VERIFICATION_QUEUE }),
  ],
  providers: [VerificationService, VerificationConsumer],
  exports: [VerificationService],
})
export class VerificationModule {}
