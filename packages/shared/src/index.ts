export enum DocumentStatus {
	PROCESSING = 'PROCESSING',
	VERIFIED = 'VERIFIED',
	REJECTED = 'REJECTED',
	INCONCLUSIVE = 'INCONCLUSIVE',
	ERROR = 'ERROR',
}

export interface IPaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	pages: number;
}

export interface IDocumentResponse {
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

export interface IAdminDocumentResponse extends IDocumentResponse {
	sellerEmail: string;
}

export interface IAuthResponse {
	userId: string;
	role: 'seller' | 'admin';
	name: string;
	email: string;
}
