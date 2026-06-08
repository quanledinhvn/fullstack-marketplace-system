import { Test } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { DocumentsRepository } from '../documents/documents.repository';
import { NotificationsService } from './notifications.service';

const mockFindByVerificationId = jest.fn();
const mockUpdateStatus = jest.fn();
const mockCreateAuditLog = jest.fn();
const mockNotify = jest.fn();

describe('WebhookService', () => {
	let service: WebhookService;

	beforeEach(async () => {
		[mockFindByVerificationId, mockUpdateStatus, mockCreateAuditLog, mockNotify].forEach((m) =>
			m.mockReset(),
		);

		const module = await Test.createTestingModule({
			providers: [
				WebhookService,
				{
					provide: DocumentsRepository,
					useValue: {
						findByVerificationId: mockFindByVerificationId,
						updateStatus: mockUpdateStatus,
						createAuditLog: mockCreateAuditLog,
					},
				},
				{
					provide: NotificationsService,
					useValue: { send: mockNotify },
				},
			],
		}).compile();

		service = module.get(WebhookService);
	});

	describe('handleResult()', () => {
		it('updates doc to VERIFIED and inserts audit log', async () => {
			mockFindByVerificationId.mockResolvedValueOnce({
				id: 'doc-1',
				status: 'PROCESSING',
				verificationId: 'vid-1',
			});

			await service.handleResult({
				verificationId: 'vid-1',
				documentId: 'doc-1',
				result: 'VERIFIED',
			});

			expect(mockUpdateStatus).toHaveBeenCalledWith('doc-1', { status: 'VERIFIED' });

			expect(mockCreateAuditLog).toHaveBeenCalledWith({
				documentId: 'doc-1',
				actionType: 'AUTO',
				actorType: 'SYSTEM',
				prevStatus: 'PROCESSING',
				nextStatus: 'VERIFIED',
			});
		});

		it('updates doc to REJECTED and inserts audit log', async () => {
			mockFindByVerificationId.mockResolvedValueOnce({
				id: 'doc-1',
				status: 'PROCESSING',
				verificationId: 'vid-1',
			});

			await service.handleResult({
				verificationId: 'vid-1',
				documentId: 'doc-1',
				result: 'REJECTED',
			});

			expect(mockUpdateStatus).toHaveBeenCalledWith('doc-1', { status: 'REJECTED' });

			expect(mockCreateAuditLog).toHaveBeenCalledWith(
				expect.objectContaining({ nextStatus: 'REJECTED', prevStatus: 'PROCESSING' }),
			);
		});

		it('updates doc to INCONCLUSIVE and inserts audit log', async () => {
			mockFindByVerificationId.mockResolvedValueOnce({
				id: 'doc-1',
				status: 'PROCESSING',
				verificationId: 'vid-1',
			});

			await service.handleResult({
				verificationId: 'vid-1',
				documentId: 'doc-1',
				result: 'INCONCLUSIVE',
			});

			expect(mockUpdateStatus).toHaveBeenCalledWith('doc-1', { status: 'INCONCLUSIVE' });

			expect(mockCreateAuditLog).toHaveBeenCalledWith(
				expect.objectContaining({ nextStatus: 'INCONCLUSIVE' }),
			);
		});

		it('is idempotent — skips mutation if doc is not PROCESSING', async () => {
			mockFindByVerificationId.mockResolvedValueOnce({
				id: 'doc-1',
				status: 'VERIFIED',
				verificationId: 'vid-1',
			});

			await service.handleResult({
				verificationId: 'vid-1',
				documentId: 'doc-1',
				result: 'VERIFIED',
			});

			expect(mockUpdateStatus).not.toHaveBeenCalled();

			expect(mockCreateAuditLog).not.toHaveBeenCalled();
		});

		it('sends notification for verified', async () => {
			mockFindByVerificationId.mockResolvedValueOnce({
				id: 'doc-1',
				status: 'PROCESSING',
				verificationId: 'vid-1',
			});

			await service.handleResult({
				verificationId: 'vid-1',
				documentId: 'doc-1',
				result: 'VERIFIED',
			});

			expect(mockNotify).toHaveBeenCalledWith('doc-1', 'VERIFIED');
		});

		it('sends notification for rejected', async () => {
			mockFindByVerificationId.mockResolvedValueOnce({
				id: 'doc-1',
				status: 'PROCESSING',
				verificationId: 'vid-1',
			});

			await service.handleResult({
				verificationId: 'vid-1',
				documentId: 'doc-1',
				result: 'REJECTED',
			});

			expect(mockNotify).toHaveBeenCalledWith('doc-1', 'REJECTED');
		});

		it('does NOT send notification for inconclusive', async () => {
			mockFindByVerificationId.mockResolvedValueOnce({
				id: 'doc-1',
				status: 'PROCESSING',
				verificationId: 'vid-1',
			});

			await service.handleResult({
				verificationId: 'vid-1',
				documentId: 'doc-1',
				result: 'INCONCLUSIVE',
			});

			expect(mockNotify).not.toHaveBeenCalled();
		});
	});
});
