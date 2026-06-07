
## Functional Requirements

### Seller
- Seller can upload documents
- Document after verification will has status: verified, rejected, inconclusive
- Seller can receive noti result + optional reason (by email)
- Seller can re-upload only when status is `rejected` (new record created)
- Seller cannot see `error` status, API returns `processing` until admin retries

### Admin
- Admin can make final call when inconclusive
- Admin can see full history: automated and manual, including who did what, when.
- Admin can retry verification if error
- Admin can see count of documents by status (error, inconclusive, etc.)

### System
- Mock verification service returns random result with variable delay

---

## Non-Functional Requirements

**Performance**
- API response < 500ms 
- Queue xử lý 100 jobs/phút

**Scalability**
- Hệ thống phải xử lý được burst 5.000 sellers/tuần mà không drop jobs

**Reliability**
- Idempotency: không gọi external service 2 lần cho cùng 1 tài liệu

**Security**
- File upload phải validate type/size
- Role-based access: seller chỉ thấy data của mình, admin thấy tất cả
- Không leak internal error ra response

**Observability**
- Audit log đầy đủ cho mọi state transition

---
## DB Schema

### users
| Column       | Type                        | Constraints         |
|--------------|-----------------------------|---------------------|
| id           | uuid                        | PK                  |
| email        | varchar                     | UNIQUE NOT NULL     |
| password_hash| varchar                     | NOT NULL            |
| name         | varchar                     | NOT NULL            |
| role         | enum(seller, admin)         | NOT NULL            |
| status       | enum(active, deleted)       | NOT NULL DEFAULT active |
| created_at   | timestamp                   | NOT NULL            |
| updated_at   | timestamp                   | NOT NULL            |

**Indexes:**
- `email` — covered by UNIQUE constraint

### documents
| Column          | Type                                                    | Constraints              |
|-----------------|---------------------------------------------------------|--------------------------|
| id              | uuid                                                    | PK                       |
| user_id         | uuid                                                    | FK → users.id NOT NULL   |
| verification_id | varchar                                                 | nullable                 |
| job_id          | varchar                                                 | nullable (BullMQ job id) |
| file_url        | varchar                                                 | NOT NULL                 |
| file_name       | varchar                                                 | NOT NULL                 |
| file_size       | integer                                                 | NOT NULL (bytes)         |
| status          | enum(pending, processing, verified, rejected, inconclusive, error) | NOT NULL DEFAULT processing |
| created_at      | timestamp                                               | NOT NULL                 |
| updated_at      | timestamp                                               | NOT NULL                 |

**Indexes:**
- `user_id` — seller list own docs
- `status` — admin filter/count; no `user_id` in query so composite unusable
- `verification_id` — webhook idempotency
- `(user_id, status)` — seller list by status

### audit_logs
| Column      | Type                    | Constraints                |
|-------------|-------------------------|----------------------------|
| id          | uuid                    | PK                         |
| document_id | uuid                    | FK → documents.id NOT NULL |
| action_type | enum(auto, manual)      | NOT NULL                   |
| actor_id    | uuid                    | nullable FK → users.id     |
| actor_type  | enum(system, admin, seller) | NOT NULL               |
| prev_status | varchar                 | nullable                   |
| next_status | varchar                 | NOT NULL                   |
| reason      | text                    | nullable                   |
| created_at  | timestamp               | NOT NULL                   |

**Indexes:**
- `document_id` — audit history lookup per document


--------

## State Machine — Verification Record

```
                  ┌─────────────┐
                  │  PROCESSING │ ◄── seller uploads (created directly as PROCESSING + enqueue job)
                  │             │ ◄── admin retry
                  └──────┬──────┘
       ┌─────────────────┼──────────────┬──────────────┐
       ▼                 ▼              ▼              ▼
  ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌───────────┐
  │ VERIFIED │  │ INCONCLUSIVE│  │ REJECTED │  │   ERROR   │
  │ [FINAL]  │  │             │  │ [FINAL]  │  │           │
  └──────────┘  └──────┬──────┘  └──────────┘  └─────┬─────┘
                  admin review                   admin decides
                ┌──────┴──────┐              ┌────────┴────────┐
                ▼             ▼              ▼                 ▼
           VERIFIED       REJECTED       PROCESSING        REJECTED
           [FINAL]        [FINAL]        (retry)           [FINAL]

Terminal states: VERIFIED, REJECTED

```

---

## Notification

- Channel: email (SMTP)
- Trigger: terminal state transition — verified, rejected

## High-Level Architecture

```mermaid
graph TD
    SellerApp[Seller App]
    AdminApp[Admin App]
    API[App - NestJS]
    DB[(PostgreSQL)]
    S3[(AWS S3)]
    Queue[BullMQ + Redis]
    Verification[Verification Service]

    SellerApp -->|REST| API
    AdminApp -->|REST| API
    API --> DB
    API --> S3
    API -->|enqueue job| Queue
    Queue -->|call| Verification
    Verification -->|POST /internal/webhook| API
```

---

## API Endpoints

### Auth
| Method | Path        | Role | Description |
|--------|-------------|------|-------------|
| POST   | /auth/login | *    | Login, trả về JWT |

### Seller
| Method | Path               | Role   | Description             |
|--------|--------------------|--------|-------------------------|
| POST   | /documents         | seller | Upload document         |
| GET    | /documents         | seller | List own documents      |
| GET    | /documents/:id     | seller | Get document status     |

### Admin
| Method | Path                           | Role  | Description              |
|--------|--------------------------------|-------|--------------------------|
| GET    | /admin/documents               | admin | List all (filter status) — dùng ?status=error để xem lỗi |
| GET    | /admin/documents/:id           | admin | Get document detail      |
| GET    | /admin/documents/stats         | admin | Count theo status (error, inconclusive, ...) |
| POST   | /admin/documents/:id/review    | admin | Resolve inconclusive     |
| POST   | /admin/documents/:id/retry     | admin | Retry error              |
| GET    | /admin/documents/:id/audit-logs| admin | Full audit history of a document |

### Internal (server-to-server)
| Method | Path               | Description                    |
|--------|--------------------|--------------------------------|
| POST   | /internal/webhook  | Callback từ mock service       |

---

## Data Flow — Launch Week (5,000 sellers)

```
5,000 sellers upload
        │
        ▼
  ┌───────────┐     5,000 jobs vào queue
  │   Queue   │
  │  (Redis)  │
  └───────────┘
        │
        │ drain tối đa 100 jobs/min
        ▼
  Rate Limiter ──► ~50 phút để xử lý hết
        │
        ▼
  External Service ($2/call) ──► ~$10,000 tổng chi phí
        │
        ▼                           Seller thấy "Đang xác minh"
  Result stored + notify seller      trong lúc chờ
```

---

## Exception Handling

### Error Matrix

| Error | Cause | Action |
|---|---|---|
| 429 Too Many Req | BullMQ misconfigured / external bug | DELAY 60s, không tính attempt |
| 5xx / Timeout / Network | External service down | Retry exponential backoff (30s → 60s → 120s → exhausted) |
| Retries Exhausted | Persistent failure sau 4 attempts | status = ERROR, job → failed set (DLQ), notify admin |

### Retry Flow

```
Worker picks job
      │
      ▼
Call External Service
      │
      ├── 2xx ──────────────► update status (verified/rejected/inconclusive)
      │
      ├── 429 ──────────────► DELAY 60s, không tính attempt
      │                       BullMQ tự resume
      │
      ├── 5xx/timeout ──────► exponential backoff retry
      │                       attempt 1 → wait 30s
      │                       attempt 2 → wait 60s
      │                       attempt 3 → wait 120s
      │                       attempt 4 → exhausted
      │                            │
      │                            ▼
      │                       status = ERROR
      │                       job → DLQ (Redis failed set)
      │                       notify admin
      │
      └── Unexpected ────────► same as 5xx
```

### Admin Retry

```
Admin GET /admin/documents?status=error
      │
      ▼
Admin POST /admin/documents/:id/retry
      │
      ▼
API lookup jobId từ DB ──► job.retry() ──► reset attempt count
      │
      ▼
status = PROCESSING ──► normal flow
```

### BullMQ Config

```
attempts: 4
backoff:
  type: exponential
  delay: 30000        ← 30s base
rateLimiter:
  max: 100
  duration: 60000     ← 100 jobs/min
```

---

## Idempotency

### Layer 1 — Worker: trước khi gọi external service

```
Worker picks job (có thể là stalled job chạy lại)
      │
      ▼
SELECT status FROM documents WHERE id = documentId
      │
      ├── status = PROCESSING ──► tiếp tục gọi external service
      │
      └── status ≠ PROCESSING ──► bỏ qua, return
          (đã được xử lý bởi lần chạy trước)
```

### Layer 2 — Webhook: khi nhận kết quả từ mock service

```
POST /internal/webhook { verificationId, result }
      │
      ▼
SELECT status FROM documents WHERE verification_id = verificationId
      │
      ├── status = PROCESSING ──► update status, insert audit_log, notify
      │
      └── status ≠ PROCESSING ──► return 200 OK, bỏ qua
          (webhook gọi lại lần 2)
```

### Tại sao không cần unique constraint?

```
status = PROCESSING là guard duy nhất cần thiết:

  - Stalled job chạy lại     ──► Layer 1 chặn trước khi gọi service
  - Webhook duplicate        ──► Layer 2 chặn trước khi update DB
  - Không cần DB constraint  ──► status transition đã đủ làm guard
```

---

## Question / Decision Log

- **Seller re-upload?** → Only allowed when status is `rejected`. Not allowed for `verified` (avoid wasting $2/call) or `processing` (avoid race condition).
- **PENDING state?** → Kept in DB enum for completeness but never used in normal flow. Document is created directly with `PROCESSING` status since upload and enqueue are always atomic within the same request. PENDING would only be meaningful if enqueue could be deferred — which is not the case.


