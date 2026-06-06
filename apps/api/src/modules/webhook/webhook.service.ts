import { Injectable } from '@nestjs/common';
import { ActionType, ActorType, DocumentStatus } from '@prisma/client';
import { DocumentsRepository } from '../documents/documents.repository';
import { NotificationsService } from './notifications.service';
import type { WebhookResultDto } from './dto/webhook-result.dto';

const TERMINAL_STATUSES = new Set<DocumentStatus>([DocumentStatus.VERIFIED, DocumentStatus.REJECTED]);

@Injectable()
export class WebhookService {
  constructor(
    private readonly repo: DocumentsRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async handleResult(dto: WebhookResultDto): Promise<void> {
    const doc = await this.repo.findByVerificationId(dto.verificationId);
    if (!doc || doc.status !== DocumentStatus.PROCESSING) return;

    const nextStatus = dto.result;

    await this.repo.updateStatus(doc.id, { status: nextStatus });
    await this.repo.createAuditLog({
      documentId: doc.id,
      actionType: ActionType.AUTO,
      actorType: ActorType.SYSTEM,
      prevStatus: DocumentStatus.PROCESSING,
      nextStatus,
    });

    if (TERMINAL_STATUSES.has(nextStatus)) {
      this.notifications.send(doc.id, nextStatus);
    }
  }
}
