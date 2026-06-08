## Mock Verification Service

Standalone HTTP server chạy riêng, simulate external verification service.
App không biết mock hay real — chỉ đổi `VERIFICATION_SERVICE_URL` trong `.env`.

---

### Endpoints

```
POST /verify
  body: { documentId, callbackUrl }
  → 202 { verificationId }
  → 429 { error, retryAfter } nếu > 100 req/min

GET /health
  → 200 { ok: true }
```

---

### Flow

```
App ──► POST /verify
        { documentId, callbackUrl }
              │
              ▼
        checkRateLimit()
              │
         > 100/min? ──► 429 { retryAfter }
              │
              ▼
        generate verificationId
        store job in-memory
              │
              ▼
        202 { verificationId }   ← trả về ngay, không block
              │
              │ fire & forget
              ▼
        processAsync()
          - random delay: 2000–30000ms
          - random result: verified / rejected / inconclusive
              │
              ▼
        POST callbackUrl
        { verificationId, documentId, result }
```

---

### Rate Limiter

In-memory counter, reset mỗi 60s. Không dùng Redis — mock chỉ chạy 1 instance.

```typescript
const counter = {
	count: 0,
	resetAt: Date.now() + 60_000,
};

function checkRateLimit(): boolean {
	const now = Date.now();

	if (now >= counter.resetAt) {
		counter.count = 0;
		counter.resetAt = now + 60_000;
	}

	if (counter.count >= 100) return false;

	counter.count++;
	return true;
}
```

---

### processAsync

Fire and forget — không block `/verify` response.

```typescript
async function processAsync(verificationId: string, documentId: string, callbackUrl: string) {
	const delay = randomInt(2000, 30000);
	await sleep(delay);

	const results = ['verified', 'rejected', 'inconclusive'];
	const result = results[randomInt(0, 2)];

	await fetch(callbackUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ verificationId, documentId, result }),
	});
}
```

---

### Design Decisions

- **In-memory store** — không cần persistence, mock restart là chấp nhận được
- **Không dùng Redis** — mock là isolated service, over-engineering nếu thêm Redis
- **callbackUrl trong request** — app tự truyền vào, mock không cần biết app URL trước
- **retryAfter trong 429** — giúp app biết chờ bao lâu trước khi retry
