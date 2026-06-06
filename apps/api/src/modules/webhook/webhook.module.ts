import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { NotificationsService } from './notifications.service';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [DocumentsModule],
  controllers: [WebhookController],
  providers: [WebhookService, NotificationsService],
})
export class WebhookModule {}
