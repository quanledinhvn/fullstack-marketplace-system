import { Test } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { DocumentsRepository } from '../documents/documents.repository';

const mockFindAll = jest.fn();

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    mockFindAll.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: DocumentsRepository,
          useValue: { findAll: mockFindAll },
        },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  describe('listAll()', () => {
    it('returns all documents without filter', async () => {
      const docs = [{ id: 'd1' }, { id: 'd2' }];
      mockFindAll.mockResolvedValueOnce(docs);

      const result = await service.listAll({ page: 1, limit: 20 });

      expect(result).toEqual(docs);
      expect(mockFindAll).toHaveBeenCalledWith({ skip: 0, take: 20, status: undefined });
    });

    it('passes status filter through', async () => {
      mockFindAll.mockResolvedValueOnce([]);

      await service.listAll({ page: 1, limit: 10, status: 'ERROR' as any });

      expect(mockFindAll).toHaveBeenCalledWith({ skip: 0, take: 10, status: 'ERROR' });
    });
  });
});
