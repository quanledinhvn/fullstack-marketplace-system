# app-monorepo boilerplate

A minimal, end-to-end monorepo starter:

| Layer       | Tech                                            | Version |
| ----------- | ----------------------------------------------- | ------- |
| Monorepo    | [moon](https://moonrepo.dev) + pnpm workspaces  | moon 2  |
| API         | [NestJS](https://nestjs.com) (Express platform) | 11.x    |
| Web         | [React](https://react.dev) + [Vite](https://vite.dev) | 19 / 8 |
| Contract    | `@app/shared` (type-only workspace package)     | local   |
| Lint/format | [Biome](https://biomejs.dev)                    | 2.x     |
| Language    | TypeScript                                      | 5.9.x   |

> TypeScript is pinned to 5.9.x: NestJS 11 relies on legacy `experimentalDecorators` /
> `emitDecoratorMetadata`, and its CLI ships TS 5.9. TS 6.0 is intentionally avoided.

## Layout

```
.
├── apps/
│   ├── api/      # NestJS app — GET /api, GET /api/health, POST /api/greeting
│   └── web/      # React + Vite SPA that calls the API
├── packages/
│   └── shared/   # Types shared by api + web (no runtime code)
└── tooling/
    └── typescript/  # tsconfig.base / .react / .nest
```

## Prerequisites

- Node `^20.19.0 || >=22.12.0` (required by Vite 8)
- pnpm 9.15.0 (`corepack enable` or install manually)

## Getting started

```bash
pnpm install

# Run both apps (moon resolves the shared build first):
pnpm dev               # moon run :dev  → api on :3001, web on :3000

# Or individually:
pnpm dev:api           # NestJS on http://localhost:3001/api
pnpm dev:web           # Vite on  http://localhost:3000
```

The web dev server proxies `/api` → `http://localhost:3001` (see
[apps/web/vite.config.ts](apps/web/vite.config.ts)), so the SPA calls the API with no CORS
fuss in development.

## Common commands

```bash
pnpm build        # moon run :build  (shared → api → web, respecting deps)
pnpm typecheck    # moon run :typecheck
pnpm lint         # biome lint .
pnpm format       # biome format --write .
pnpm clean        # remove node_modules, dist, moon cache
```

Per-project (cache-aware) via moon, e.g. `moon run api:build`, `moon run web:typecheck`.

## How the contract works

`packages/shared` exports **types only**. Both apps import them with `import type`, so the
declarations are erased at compile time — the same package safely serves the CommonJS Nest
build and the ESM Vite build with zero runtime footprint. Change a shape once in
`@app/shared` and both sides type-check against it.

## Extending

This is deliberately minimal (no database, auth, or testing yet). Natural next steps:

- Add a database module to the API (`@nestjs/typeorm`, Prisma, Drizzle, …).
- Add tests (Jest for the API, Vitest for the web).
- Add a real router/state layer to the web app when it grows.
