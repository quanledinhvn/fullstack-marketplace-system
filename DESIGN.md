Short and pointed on purpose. We don't want a comprehensive design doc — we want to see where your judgment lives. Answer these directly. Vague answers score worse than no answer.

---

1. **The one question.** Of everything you'd want to ask the product owner before building this, what is the *single* question whose answer most changes your architecture? Sketch — a few lines each — the two different designs you'd build depending on the answer. Then state which answer you assumed and built toward.

**Answer:**

Can a seller re-upload a document? If yes — when?

**If not allowed:**
- One document per seller
- Rejected = account blocked until admin unlocks
- No re-upload logic, no state machine branching

**If allowed:**
- Re-upload during `processing` → race condition with pending webhook
- Re-upload after `verified` → wastes $2
- Only safe window: after `rejected`

I assumed re-upload is allowed, only when status is `rejected`. New upload = new record. Old record stays for audit history.

---

2. **Launch week.** ~5,000 sellers arrive in the first week. The verification service costs $2 a call and caps at 100 calls/minute. Walk us through what your system actually *does* under that load — what the seller experiences while waiting, what you spend, what you protect when you can't have everything. There is no right answer; show us the trade-off you chose **and the one you rejected.** Close by naming the part of this approach you're least sure about and what would make you reverse it.

**Answer:**

**What the system does:**
- 5,000 sellers upload → 5,000 jobs enter BullMQ immediately
- Queue drains at 100 jobs/min → ~50 minutes to clear
- Each job: worker picks up → POST /verify → wait for webhook → update DB → send email

**What the seller sees:**
- Upload succeeds instantly
- Status shows `processing`, no estimated wait time
- First sellers wait minutes, last sellers wait ~50 minutes

**What it costs:** 5,000 × $2 = $10,000 minimum

**What I protect:**
- No dropped jobs — every upload gets processed
- BullMQ rate limiter enforces 100/min cap — excess jobs queue, not rejected

**Trade-off I chose:**
- FIFO queue, sellers upload freely, queue handles the rest
- Simplest design that survives launch week without losing data

**Trade-off I rejected:**
- Cronjob polling DB every minute for pending documents
- Looks simpler at first, but needs retry logic, backoff, attempt counters, DLQ — rebuilding BullMQ from scratch, worse

**Least confident:**
- No estimated wait time for sellers
- Multiple bursts → later arrivals wait longer with no feedback
- Would add priority queue (oldest first) if PO sets a hard SLA — e.g. "verified/rejected within 3 hours"

---

3. **The state machine.** Draw the lifecycle of a single verification record: states, transitions, what guards each transition, which states are terminal. (ASCII or Mermaid.) Then defend *one* specific guard or terminal-state choice that you think a careless engineer would get wrong.

**Answer:**

```
                    ┌─────────┐
                    │ PENDING │ ◄── seller uploads
                    └────┬────┘
                         │ enqueue job
                         ▼
                  ┌─────────────┐
                  │  PROCESSING │ ◄── worker picks up job / admin retries
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

**Guards:**
- `PENDING → PROCESSING`: worker picks up the job
- `PROCESSING → VERIFIED/REJECTED/INCONCLUSIVE`: webhook result received, status must be `PROCESSING` (idempotency)
- `INCONCLUSIVE → VERIFIED/REJECTED`: admin role required
- `ERROR → PROCESSING`: admin role required (retry)
- `ERROR → REJECTED`: admin role required (reject without retry)

**Defense — ERROR is not terminal, but only admin can exit it:**

A careless engineer would either make ERROR terminal or let sellers retry themselves.

- Making it terminal: seller is stuck forever for an infrastructure failure they didn't cause
- Letting sellers retry: if service is still down, retries add load and waste money

Correct: ERROR waits for admin. Admin verifies the service has recovered, then retries (→ PROCESSING) or rejects outright (→ REJECTED). Seller sees `processing` the whole time — no confusion, no spam retries.

---

4. **What you deliberately did not build.** Pick the most significant thing a thorough engineer might have included that you cut on purpose. Why was cutting it the *right* call for a v1 — not just the convenient one? What risk does cutting it create?

**Answer:**

Document deduplication — no check if a seller uploads the same file twice.

**Why cut:**
- Not in the requirements
- Adding it means: hashing the file, storing the hash, checking before creating a record — extra complexity for an edge case
- Sellers re-uploading the same file by accident is rare, not a core flow

**Risk:**
- Seller accidentally uploads the same file twice → two jobs created → $4 spent instead of $2
- Queue gets an extra unnecessary job

---

5. **The failure that worries you most.** Of all the ways this breaks in production, which one would actually page someone at 3am? Describe your specific mitigation. ("Add retries" is not a mitigation — what retries, on what, with what backoff, and what happens when they're exhausted?)

**Answer:**

Verification service goes down during launch week with thousands of jobs in the queue.

**Why this pages at 3am:**
- Money is being wasted on failed attempts ($2/call)
- Sellers are actively waiting
- System cannot recover on its own

**Mitigation:**
- `429` → fixed 60s delay, does not count as an attempt, BullMQ resumes automatically
- `5xx / timeout` → exponential backoff: 30s → 60s → 120s → attempt 4 exhausted
- Exactly 4 attempts, 30s base, exponential — only for 5xx/timeout, not for 429

**When exhausted:**
- Document status → `ERROR`
- Job → DLQ (Redis failed set), not deleted
- Admin notified
- Admin checks `GET /admin/documents?status=error`
- After service recovers → admin retries via `POST /admin/documents/:id/retry`
- Retry resets attempt count, job re-enters normal flow

**Possible improvement:** Circuit breaker — but current backoff is sufficient for v1. Can add in a later version.
