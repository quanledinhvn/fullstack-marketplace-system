import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  send(documentId: string, status: string): void {
    console.log(`[notification] document=${documentId} status=${status}`);
  }
}
