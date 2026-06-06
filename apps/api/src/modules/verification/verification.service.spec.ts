import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import type { AxiosResponse } from 'axios';
import { VerificationService, RateLimitError, ServiceError } from './verification.service';

const mockPost = jest.fn();

describe('VerificationService', () => {
  let service: VerificationService;

  beforeEach(async () => {
    mockPost.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) => {
              if (key === 'VERIFICATION_SERVICE_URL') return 'http://mock-verify:3001';
              if (key === 'API_URL') return 'http://api:3000';
              return fallback;
            },
          },
        },
        {
          provide: HttpService,
          useValue: { post: mockPost },
        },
      ],
    }).compile();
    service = module.get(VerificationService);
  });

  it('returns verificationId when mock service responds 202', async () => {
    const axiosResponse: AxiosResponse = {
      status: 202,
      data: { verificationId: 'vid-123' },
      statusText: 'Accepted',
      headers: {},
      config: {} as any,
    };
    mockPost.mockReturnValueOnce(of(axiosResponse));

    const result = await service.callMockService('doc-1');
    expect(result).toEqual({ verificationId: 'vid-123' });
    expect(mockPost).toHaveBeenCalledWith(
      'http://mock-verify:3001/verify',
      { documentId: 'doc-1', callbackUrl: 'http://api:3000/internal/webhook' },
      expect.objectContaining({ validateStatus: expect.any(Function) }),
    );
  });

  it('throws RateLimitError on 429', async () => {
    const axiosResponse: AxiosResponse = {
      status: 429,
      data: {},
      statusText: 'Too Many Requests',
      headers: {},
      config: {} as any,
    };
    mockPost.mockReturnValueOnce(of(axiosResponse));

    await expect(service.callMockService('doc-1')).rejects.toThrow(RateLimitError);
  });

  it('throws ServiceError on 5xx response', async () => {
    const axiosResponse: AxiosResponse = {
      status: 503,
      data: {},
      statusText: 'Service Unavailable',
      headers: {},
      config: {} as any,
    };
    mockPost.mockReturnValueOnce(of(axiosResponse));

    await expect(service.callMockService('doc-1')).rejects.toThrow(ServiceError);
  });
});
