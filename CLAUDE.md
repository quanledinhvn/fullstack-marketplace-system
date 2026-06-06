# CLAUDE.md

## Communication
- Call me Ryan in every response, any language.
- Reporting: extremely concise; sacrifice grammar for concision.

## Project

KVY Tech take-home: Document Verification Workflow for a marketplace

### System Design & Scope

**Core docs** (must read before coding):
- `@docs/system-design.md` — DB schema, state machine, API endpoints, error handling, idempotency strategy
- `@docs/kvy_tech.md` — requirements, scoring criteria, what to build, submission checklist

**Implementation structure** (strict adherence required):
- `@docs/api-impl-structure.md` — NestJS folder layout, layer responsibilities, auth strategy (header-based, no JWT)
- `@docs/web-impl-structure.md` — React/Vite structure, modules, routes, stores, API client

**Prototypes** (reference when coding):
- `docs/prototypes/` — reference UI/UX designs; code must follow these

### Build Decisions
- Backend: NestJS + Prisma + PostgreSQL + BullMQ
- Frontend: React + Vite + TanStack Router + shadcn/ui + Zustand

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature-slug>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
