import type { DocumentStatus } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';

describe('POST /api/internal/webhook (integration)', () => {
	let prisma: PrismaService;
	let testUserId: string;

	beforeAll(async () => {
		prisma = global.testContext.module.get(PrismaService);

		const user = await prisma.user.create({
			data: {
				email: `webhook-test-${Date.now()}@test.com`,
				passwordHash: 'hash',
				name: 'Test User',
				role: 'SELLER',
			},
		});

		testUserId = user.id;
	});

	afterAll(async () => {
		await prisma.auditLog.deleteMany({ where: { document: { userId: testUserId } } });

		await prisma.document.deleteMany({ where: { userId: testUserId } });

		await prisma.user.delete({ where: { id: testUserId } });
	});

	afterEach(async () => {
		await prisma.auditLog.deleteMany({ where: { document: { userId: testUserId } } });

		await prisma.document.deleteMany({ where: { userId: testUserId } });
	});

	function createDocument(overrides: { status?: DocumentStatus; verificationId?: string } = {}) {
		return prisma.document.create({
			data: {
				userId: testUserId,
				fileName: 'test.pdf',
				fileSize: 1024,
				fileUrl: 'https://example.com/test.pdf',
				status: overrides.status ?? 'PROCESSING',
				verificationId: overrides.verificationId ?? `vid-${Date.now()}-${Math.random()}`,
			},
		});
	}

	it('verified: updates status to VERIFIED and writes audit log', async () => {
		const doc = await createDocument({ status: 'PROCESSING' });

		await request(global.testContext.app.getHttpServer())
			.post('/api/internal/webhook')
			.send({ verificationId: doc.verificationId, documentId: doc.id, result: 'verified' })
			.expect(200);

		const updated = await prisma.document.findUnique({ where: { id: doc.id } });

		expect(updated?.status).toBe('VERIFIED');

		const logs = await prisma.auditLog.findMany({ where: { documentId: doc.id } });

		expect(logs).toHaveLength(1);

		expect(logs[0]?.prevStatus).toBe('PROCESSING');

		expect(logs[0]?.nextStatus).toBe('VERIFIED');

		expect(logs[0]?.actorType).toBe('SYSTEM');
	});

	it('rejected: updates status to REJECTED and writes audit log', async () => {
		const doc = await createDocument({ status: 'PROCESSING' });

		await request(global.testContext.app.getHttpServer())
			.post('/api/internal/webhook')
			.send({ verificationId: doc.verificationId, documentId: doc.id, result: 'rejected' })
			.expect(200);

		const updated = await prisma.document.findUnique({ where: { id: doc.id } });

		expect(updated?.status).toBe('REJECTED');

		const logs = await prisma.auditLog.findMany({ where: { documentId: doc.id } });

		expect(logs).toHaveLength(1);

		expect(logs[0]?.prevStatus).toBe('PROCESSING');

		expect(logs[0]?.nextStatus).toBe('REJECTED');

		expect(logs[0]?.actorType).toBe('SYSTEM');
	});

	it('inconclusive: updates status to INCONCLUSIVE and writes audit log', async () => {
		const doc = await createDocument({ status: 'PROCESSING' });

		await request(global.testContext.app.getHttpServer())
			.post('/api/internal/webhook')
			.send({ verificationId: doc.verificationId, documentId: doc.id, result: 'inconclusive' })
			.expect(200);

		const updated = await prisma.document.findUnique({ where: { id: doc.id } });

		expect(updated?.status).toBe('INCONCLUSIVE');

		const logs = await prisma.auditLog.findMany({ where: { documentId: doc.id } });

		expect(logs).toHaveLength(1);

		expect(logs[0]?.nextStatus).toBe('INCONCLUSIVE');

		expect(logs[0]?.actorType).toBe('SYSTEM');
	});

	it('idempotency: already-verified document is untouched, no new audit log', async () => {
		const doc = await createDocument({ status: 'VERIFIED' });

		await request(global.testContext.app.getHttpServer())
			.post('/api/internal/webhook')
			.send({ verificationId: doc.verificationId, documentId: doc.id, result: 'verified' })
			.expect(200);

		const after = await prisma.document.findUnique({ where: { id: doc.id } });

		expect(after?.status).toBe('VERIFIED');

		const logs = await prisma.auditLog.findMany({ where: { documentId: doc.id } });

		expect(logs).toHaveLength(0);
	});

	it('unknown verificationId: returns 200 no-op', async () => {
		await request(global.testContext.app.getHttpServer())
			.post('/api/internal/webhook')
			.send({ verificationId: 'does-not-exist', documentId: 'irrelevant', result: 'verified' })
			.expect(200);
	});
});
