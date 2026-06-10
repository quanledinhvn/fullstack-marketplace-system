import { http, HttpResponse } from 'msw';
import { DocumentStatus } from '@app/shared';
import type { IAuthResponse, IDocumentResponse, IAdminDocumentResponse } from '@app/shared';

const BASE = '/api';

const mockUsers: Record<string, IAuthResponse> = {
	admin: { userId: 'admin-1', role: 'admin', name: 'Admin Demo', email: 'admin@demo.com' },
	seller: { userId: 'user-1', role: 'seller', name: 'Seller Demo', email: 'seller@demo.com' },
};

const mockDocs: IDocumentResponse[] = [
	{
		id: 'doc-1',
		userId: 'user-1',
		fileName: 'passport.pdf',
		fileSize: 102400,
		status: DocumentStatus.VERIFIED,
		verificationId: 'v-1',
		jobId: null,
		createdAt: new Date('2026-06-01T10:00:00Z'),
		updatedAt: new Date('2026-06-01T10:05:00Z'),
	},
	{
		id: 'doc-2',
		userId: 'user-1',
		fileName: 'license.pdf',
		fileSize: 204800,
		status: DocumentStatus.PROCESSING,
		verificationId: null,
		jobId: 'j-1',
		createdAt: new Date('2026-06-02T09:00:00Z'),
		updatedAt: new Date('2026-06-02T09:00:00Z'),
	},
	{
		id: 'doc-3',
		userId: 'user-1',
		fileName: 'id-card.jpg',
		fileSize: 51200,
		status: DocumentStatus.REJECTED,
		verificationId: 'v-2',
		jobId: null,
		createdAt: new Date('2026-06-03T14:00:00Z'),
		updatedAt: new Date('2026-06-03T14:10:00Z'),
	},
];

export const handlers = [
	http.post(`${BASE}/auth/login`, async ({ request }) => {
		const { email } = (await request.json()) as { email: string; password: string };
		const user = email.includes('admin') ? mockUsers.admin : mockUsers.seller;
		return HttpResponse.json(user);
	}),

	http.get(`${BASE}/documents`, () => {
		return HttpResponse.json(mockDocs);
	}),

	http.post(`${BASE}/documents`, async ({ request }) => {
		const body = (await request.json()) as {
			fileName: string;
			fileSize: number;
			mimeType: string;
		};
		const newDoc: IDocumentResponse = {
			id: `doc-${mockDocs.length + 1}`,
			userId: 'user-1',
			fileName: body.fileName,
			fileSize: body.fileSize,
			status: DocumentStatus.PROCESSING,
			verificationId: null,
			jobId: `j-${mockDocs.length + 1}`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		mockDocs.push(newDoc);
		return HttpResponse.json(newDoc, { status: 201 });
	}),

	http.get(`${BASE}/admin/documents`, ({ request }) => {
		const status = new URL(request.url).searchParams.get('status');
		const allDocs: IAdminDocumentResponse[] = mockDocs.map((d) => ({
			...d,
			sellerEmail: 'seller@demo.com',
		}));
		const result = status ? allDocs.filter((d) => d.status === status) : allDocs;
		return HttpResponse.json(result);
	}),
];
