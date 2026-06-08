# ESLint + Prettier Migration Design

## Context

Replace Biome with ESLint + Prettier across the monorepo. Motivation: Biome 2.x has a known parse error for NestJS-style parameter decorators (`@Body()`, `@Param()`, etc.) that cannot be suppressed via config or comments, causing false IDE diagnostics.

## Architecture

Single root-level config (Option B) — one `eslint.config.js` and one `.prettierrc` at the monorepo root, with per-app overrides via glob patterns.

```
/
├── eslint.config.js       # flat config: base + NestJS overrides + React overrides
├── .prettierrc            # tab, indent 2, line 100
├── .prettierignore
└── package.json           # updated scripts, new devDeps, Biome removed
```

## ESLint Config Structure

Three sections in `eslint.config.js`:

1. **Base** — applies to all `**/*.ts` and `**/*.tsx`:
   - `typescript-eslint` recommended rules
   - `@typescript-eslint/no-unused-vars` (error)
   - `@typescript-eslint/no-explicit-any` (warn)
   - `@typescript-eslint/no-non-null-assertion` (warn)
   - `@typescript-eslint/consistent-type-imports` (error) — equivalent to Biome `useImportType`
   - `prefer-const` (error)

2. **NestJS overrides** — `apps/api/**/*.ts`:
   - Parser: `@typescript-eslint/parser` with `experimentalDecorators: true`, `emitDecoratorMetadata: true`
   - No additional rules beyond base

3. **React overrides** — `apps/web/**/*.{ts,tsx}`:
   - `eslint-plugin-react` + `eslint-plugin-react-hooks` recommended rules
   - React 19 (no need to flag `react/react-in-jsx-scope`)

## Prettier Config

Matches current Biome formatter settings:

- `useTabs: true`
- `tabWidth: 2`
- `printWidth: 100`
- `singleQuote: true`

## Packages

Root `devDependencies`:

- `eslint`
- `typescript-eslint`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-config-prettier`
- `prettier`

Remove: `@biomejs/biome`

## Scripts

```json
"lint": "eslint .",
"format": "prettier --write .",
"fix": "eslint --fix . && prettier --write ."
```

## Files to Remove

- `biome.json`

## Rules Mapping

| Biome rule           | ESLint equivalent                            | Severity |
| -------------------- | -------------------------------------------- | -------- |
| `noUnusedVariables`  | `@typescript-eslint/no-unused-vars`          | error    |
| `noUnusedImports`    | `@typescript-eslint/no-unused-vars`          | error    |
| `noExplicitAny`      | `@typescript-eslint/no-explicit-any`         | warn     |
| `useConst`           | `prefer-const`                               | error    |
| `noNonNullAssertion` | `@typescript-eslint/no-non-null-assertion`   | warn     |
| `useImportType`      | `@typescript-eslint/consistent-type-imports` | error    |
