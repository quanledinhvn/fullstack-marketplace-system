import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { tryConsume } from './rate-limiter';
import { processAsync } from './processor';

const app = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
	res.json({ ok: true });
});

app.post('/verify', (req: Request, res: Response) => {
	const { documentId, callbackUrl } = req.body as {
		documentId?: string;
		callbackUrl?: string;
	};

	if (!documentId || !callbackUrl) {
		res.status(400).json({ error: 'documentId and callbackUrl are required' });

		return;
	}

	const check = tryConsume();

	if (!check.allowed) {
		res.status(429).json({ error: 'Rate limit exceeded', retryAfter: check.retryAfter });

		return;
	}

	const verificationId = crypto.randomUUID();

	console.log(
		`[verify] documentId=${documentId} verificationId=${verificationId} callbackUrl=${callbackUrl}`,
	);

	processAsync({ verificationId, documentId, callbackUrl });

	res.status(202).json({ verificationId });
});

const PORT = process.env.PORT ?? 3002;

app.listen(PORT, () => {
	console.log(`mock-service listening on port ${PORT}`);
});
