import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

export class RateLimitError extends Error {
  constructor() { super('RATE_LIMITED'); }
}

export class ServiceError extends Error {
  constructor() { super('SERVICE_ERROR'); }
}

@Injectable()
export class VerificationService {
  private readonly verifyUrl: string;
  private readonly callbackUrl: string;

  constructor(
    config: ConfigService,
    private readonly http: HttpService,
  ) {
    const base = config.get<string>('VERIFICATION_SERVICE_URL', 'http://localhost:3001');
    const api = config.get<string>('API_URL', 'http://localhost:3000');
    this.verifyUrl = `${base}/verify`;
    this.callbackUrl = `${api}/internal/webhook`;
  }

  async callMockService(documentId: string): Promise<{ verificationId: string }> {
    const res = await lastValueFrom(
      this.http.post<{ verificationId: string }>(this.verifyUrl, {
        documentId,
        callbackUrl: this.callbackUrl,
      }, {
        // Axios throws AxiosError for 4xx/5xx by default.
        // We handle status codes manually, so allow all statuses through.
        validateStatus: () => true,
      }),
    );

    if (res.status === 429) throw new RateLimitError();
    if (res.status >= 500) throw new ServiceError();

    return res.data;
  }
}
