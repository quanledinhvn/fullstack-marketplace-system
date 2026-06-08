# Code Style

## TypeScript Naming Conventions

### Interfaces — prefix `I`

```ts
// correct
export interface IDocumentResponse { ... }
export interface IAdminDocumentResponse extends IDocumentResponse { ... }

// wrong
export interface TDocumentResponse { ... }
export interface DocumentResponse { ... }
```

### Types — prefix `T`

```ts
// correct
type TDocumentStatus = 'PROCESSING' | 'VERIFIED';

// wrong
type DocumentStatus = 'PROCESSING' | 'VERIFIED';
```

### Enums, Classes, DTOs — no prefix

```ts
export enum DocumentStatus { ... }
export class AdminDocumentResponseDto { ... }
```

## Formatting

### Blank lines between statements

**All statements must be separated by a blank line** for readability.  
Exceptions — same-kind, related statements may stay together without a blank line:

| Prev → Next                               | Blank line required? |
| ----------------------------------------- | -------------------- |
| `import` → `import`                       | No                   |
| `const`/`let`/`var` → `const`/`let`/`var` | No                   |
| `export` → `export`                       | No                   |
| anything → `return`                       | **Yes**              |
| anything else                             | **Yes**              |

```ts
// correct
const userId = ctx.userId;
const query = buildQuery(userId);

const docs = await this.service.list(query);

return docs.map(toDto);

// wrong — missing blank lines
const userId = ctx.userId;
const query = buildQuery(userId);
const docs = await this.service.list(query);
return docs.map(toDto);
```

Consecutive `const`/`let`/`var` declarations that are logically related may stay together:

```ts
// ok — related declarations
const page = query.page ?? 1;
const pageSize = query.pageSize ?? 20;
const offset = (page - 1) * pageSize;
```

### Enforcement

This rule is enforced by ESLint (`padding-line-between-statements`). Auto-fix with:

```sh
npm run fix
```
