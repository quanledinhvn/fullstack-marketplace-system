import { Test } from '@nestjs/testing';
import { VerificationConsumer } from './verification.consumer';
import { VerificationService, RateLimitError } from './verification.service';
import { DocumentsRepository } from '../documents/documents.repository';
import type { Job } from 'bullmq';

const mockCallMockService = jest.fn();
const mockFindById = jest.fn();
const mockUpdateStatus = jest.fn();
const mockCreateAuditLog = jest.fn();

function makeJob(data: object, overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    data,
    moveToDelayed: jest.fn(),
    ...overrides,
  } as unknown as Job;
}

describe('VerificationConsumer', () => {
  let consumer: VerificationConsumer;

  beforeEach(async () => {
    mockCallMockService.mockReset();
    mockFindById.mockReset();
    mockUpdateStatus.mockReset();
    mockCreateAuditLog.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        VerificationConsumer,
        {
          provide: VerificationService,
          useValue: { callMockService: mockCallMockService },
        },
        {
          provide: DocumentsRepository,
          useValue: {
            findById: mockFindById,
            updateStatus: mockUpdateStatus,
            createAuditLog: mockCreateAuditLog,
          },
        },
      ],
    }).compile();

    consumer = module.get(VerificationConsumer);
  });

  describe('process()', () => {
    it('skips job if document status is not processing', async () => {
      mockFindById.mockResolvedValueOnce({ id: 'doc-1', status: 'PENDING' });
      const job = makeJob({ documentId: 'doc-1' });

      await consumer.process(job);

      expect(mockCallMockService).not.toHaveBeenCalled();
    });

    it('calls mock service and stores verificationId when status is processing', async () => {
      mockFindById.mockResolvedValueOnce({ id: 'doc-1', status: 'PROCESSING' });
      mockCallMockService.mockResolvedValueOnce({ verificationId: 'vid-abc' });
      const job = makeJob({ documentId: 'doc-1' });

      await consumer.process(job);

      expect(mockCallMockService).toHaveBeenCalledWith('doc-1');
      expect(mockUpdateStatus).toHaveBeenCalledWith('doc-1', { verificationId: 'vid-abc' });
    });

    it('delays job 60s without counting attempt on 429', async () => {
      mockFindById.mockResolvedValueOnce({ id: 'doc-1', status: 'PROCESSING' });
      mockCallMockService.mockRejectedValueOnce(new RateLimitError());
      const moveToDelayed = jest.fn();
      const job = makeJob({ documentId: 'doc-1' }, { moveToDelayed } as any);

      await consumer.process(job);

      expect(moveToDelayed).toHaveBeenCalledWith(expect.any(Number), undefined);
    });

    it('re-throws on 5xx so BullMQ can retry', async () => {
      mockFindById.mockResolvedValueOnce({ id: 'doc-1', status: 'PROCESSING' });
      mockCallMockService.mockRejectedValueOnce(new Error('SERVICE_ERROR'));
      const job = makeJob({ documentId: 'doc-1' });

      await expect(consumer.process(job)).rejects.toThrow('SERVICE_ERROR');
    });
  });

  describe('onFailed()', () => {
    it('sets document to error and inserts audit_log on exhausted retries', async () => {
      mockFindById.mockResolvedValueOnce({ id: 'doc-1', status: 'PROCESSING' });
      const job = makeJob({ documentId: 'doc-1' }, { attemptsMade: 4 } as any);

      await consumer.onFailed(job, new Error('SERVICE_ERROR'));

      expect(mockUpdateStatus).toHaveBeenCalledWith('doc-1', { status: 'ERROR' });
      expect(mockCreateAuditLog).toHaveBeenCalledWith({
        documentId: 'doc-1',
        actionType: 'AUTO',
        actorType: 'SYSTEM',
        nextStatus: 'ERROR',
        prevStatus: 'PROCESSING',
      });
    });

    it('does nothing if job has remaining attempts', async () => {
      const job = makeJob({ documentId: 'doc-1' }, { attemptsMade: 2, opts: { attempts: 4 } } as any);

      await consumer.onFailed(job, new Error('oops'));

      expect(mockUpdateStatus).not.toHaveBeenCalled();
    });
  });
});
