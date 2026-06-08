# KVY TECH — Full-stack Engineer Take-Home

**Feature:** Document Verification Workflow
**Your actual working time:** ~4–5 hours
**Deadline:** 4 days from receipt.
**Submission:** One public GitHub repo + a deployed URL.

---

## Read this first — how this is actually scored

Most of your score does **not** come from this repo. It comes from a 30-minute live conversation afterward, where we ask you to walk through your design and then _change it_ in real time. This take-home exists to give us something concrete to talk about, not to be a polished masterpiece.

That changes how you should spend your time:

- We are not impressed by length or by covering every base. We are impressed by **judgment**: what you chose to build, what you chose _not_ to, and whether you can defend both.
- This problem has **no single right design** (see "Operating conditions" below). We are not checking whether your architecture matches some answer key. We're checking whether you saw the real tension, picked a side, and can own the trade-off you accepted.
- A small, honest, coherent submission beats a large, generic one. Every time.
- Use AI tools freely — we expect it. But you will have to explain and extend your own work live, without them. Submit only what you actually understand.

---

## The feature

A marketplace requires sellers to upload a business verification document (license, tax registration) before they can list products. The flow:

1. Seller uploads a document.
2. The system sends it to an **external verification service** (you'll mock this). The call is async and can take seconds to hours.
3. The service eventually returns `verified`, `rejected`, or `inconclusive`.
4. `inconclusive` documents go to a human admin, who makes the final call.
5. The seller is notified of the outcome (with an optional reason).
6. Admins can see the full history of every verification attempt — automated and manual — including who did what, when.

### Operating conditions — read these as real, not as footnotes

The external verification service is not free and not instant, and your marketplace is about to grow fast. These are the conditions your design has to survive:

- Each verification call **costs $2**.
- The service accepts at most **100 calls per minute**; beyond that it rejects you.
- A launch push onboards roughly **5,000 sellers in the first week.**

There is no clean way to satisfy all of cost, throughput, and seller experience at once. The heart of this exercise is **how you trade them off.** We are far more interested in that than in the CRUD around it.

---

## What you submit

Three things in one repo. The headline numbers are time _guidance_, not targets.

### 1. `DESIGN.md` (~1 hour)

Short and pointed on purpose. We don't want a comprehensive design doc — we want to see where your judgment lives. Answer these directly. Vague answers score worse than no answer.

1. **The one question.** Of everything you'd want to ask the product owner before building this, what is the _single_ question whose answer most changes your architecture? Sketch — a few lines each — the two different designs you'd build depending on the answer. Then state which answer you assumed and built toward.

2. **Launch week.** ~5,000 sellers arrive in the first week. The verification service costs $2 a call and caps at 100 calls/minute. Walk us through what your system actually _does_ under that load — what the seller experiences while waiting, what you spend, what you protect when you can't have everything. There is no right answer; show us the trade-off you chose **and the one you rejected.** Close by naming the part of this approach you're least sure about and what would make you reverse it.

3. **The state machine.** Draw the lifecycle of a single verification record: states, transitions, what guards each transition, which states are terminal. (ASCII or Mermaid.) Then defend _one_ specific guard or terminal-state choice that you think a careless engineer would get wrong.

4. **What you deliberately did not build.** Pick the most significant thing a thorough engineer might have included that you cut on purpose. Why was cutting it the _right_ call for a v1 — not just the convenient one? What risk does cutting it create?

5. **The failure that worries you most.** Of all the ways this breaks in production, which one would actually page someone at 3am? Describe your specific mitigation. ("Add retries" is not a mitigation — what retries, on what, with what backoff, and what happens when they're exhausted?)

### 2. Implementation + `README.md` (~2.5 hours)

Build the slice that best demonstrates the spine of your design. Pick **one** complete path and make it work end-to-end — e.g. `upload → automated result → admin sees it`, or `upload → inconclusive → admin reviews → seller notified`.

We care about two things and almost nothing else:

- **It runs**, end-to-end, for that one path, at a public URL.
- **The code matches your `DESIGN.md`.** If your design describes a state machine, a queue, or a failure path, we expect to find it in the code. Drift between the doc and the code is a signal to us.

Within what you build: backend input validation, errors that don't leak internals, at least one meaningful test of the core behavior, no secrets committed (`.env.example` instead).

Your `README.md` must include:

- **What I built** — what works, what's partial, what's stubbed. Be exact. An accurate "60%" beats a dishonest "100%."
- **What I'd build next** and why.
- **How to run it**, the deployed URL, and seeded credentials (≥1 seller, ≥1 admin).

### 3. `AI-LOG.md` (~15 minutes)

A short, honest log of how you worked with AI tools. Not a confession — a record of judgment. We want:

- The two or three things you delegated to AI.
- One concrete case where the AI was **wrong or weak**, you caught it, and you fixed it. Show the before and after, briefly.
- One thing you verified yourself rather than trusting.

A thin, generic log tells us as much as a rich, specific one — just the opposite thing.

---

## Stack

**TypeScript is required on both backend and frontend.** Everything else is your call — pick what you can defend.

| Layer            | Pick one (or similar)                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Backend          | Express · NestJS · Fastify · Hono                                          |
| Frontend         | React · Next.js · Vue · Nuxt                                               |
| Database         | PostgreSQL · MySQL · SQLite                                                |
| Async processing | BullMQ · pg-boss · native workers · cron · simpler — be ready to defend it |
| Deployment       | Any free tier: Vercel · Railway · Render · Fly.io · Supabase               |

Two things are required regardless of stack:

- **Two UI views.** A _seller_ view (login, upload, see status) and an _admin_ view (login, see pending, review inconclusive, decide). Same app with role-based routing or two apps — your call.
- **A mocked verification service.** Build your own mock. _How_ you mock it — including how it enforces the 100/min rate limit and the variable delay — is itself a design decision we'll read.

---

## Submit

Email us with subject **"KVY Take-home Submission — [Your Name]"** and the repo link. If you need an extension for a real reason, ask early.
