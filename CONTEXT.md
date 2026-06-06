# CONTEXT.md — Document Verification Workflow

## Glossary

**Seller**
A marketplace participant who submits a business verification document to gain the right to list products.

**Admin**
An internal operator who reviews inconclusive verification results and manages system errors.

**Document**
A business verification file (license, tax registration) uploaded by a Seller. One record per upload attempt; a new record is created on each re-upload.

**Verification**
The automated process of sending a Document to the external Verification Service and receiving a result. One Verification per Document.

**Verification Record**
The database row in `documents` that tracks a Document through its full lifecycle: status, verification ID, job ID, file metadata.

**Verification Service**
The external (mocked) HTTP service that accepts a document reference, performs async checking, and calls back with a result. Not free ($2/call), rate-limited (100 calls/min).

**Mock Service**
A local Express server that simulates the Verification Service. Implements the same contract (POST /verify → 202, callback via POST to callbackUrl) with random delay and random result. Rate limit enforced in-memory.

**Terminal State**
VERIFIED or REJECTED. No further automated transitions are possible from these states.

**Audit Log**
An immutable append-only record of every status transition for a Document, capturing: who acted (system/admin/seller), what the previous and next status were, when it happened, and an optional reason.

**Job**
A BullMQ task representing a single verification call. Created when a Document is uploaded (status → PROCESSING). Retried on failure up to 4 attempts with exponential backoff.

**Webhook**
The HTTP callback from the Verification Service (or Mock Service) to `POST /internal/webhook`, delivering the verification result. Idempotency guarded by checking current Document status before processing.
