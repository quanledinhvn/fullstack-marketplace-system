export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  INCONCLUSIVE = 'INCONCLUSIVE',
  ERROR = 'ERROR',
}

export type TApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export interface TPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface TDocumentResponse {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  status: DocumentStatus;
  verificationId: string | null;
  jobId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TAdminDocumentResponse extends TDocumentResponse {
  sellerEmail: string;
}

export interface TAuthResponse {
  userId: string;
  role: 'seller' | 'admin';
  name: string;
  email: string;
}
