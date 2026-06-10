Status: ready-for-agent

# 01 — Tailwind + shadcn foundation

## What to build

Install and wire up Tailwind CSS and shadcn/ui as the styling foundation for the web app. This slice produces no visible UI changes — it solely establishes the build infrastructure that all subsequent migration slices depend on.

- Install `tailwindcss`, `postcss`, `autoprefixer` dev dependencies in `apps/web`
- Run `shadcn init` with style `default`, base color `zinc`, no dark mode
- Create `src/globals.css` with Tailwind directives (`@tailwind base/components/utilities`) and the shadcn CSS variable block — omit the `.dark { ... }` block entirely
- Delete `src/styles.css` and `src/styles/auth-layout.css`
- Replace the deleted imports in `src/main.tsx` with a single import of `src/globals.css`
- Add `tailwind.config.ts` with content paths covering `src/**/*.{ts,tsx}`
- Add `postcss.config.js` with `tailwindcss` and `autoprefixer` plugins
- Confirm `@/` path alias in `tsconfig.json` is already set (it is — no change needed)

## Acceptance criteria

- [ ] `pnpm dev` starts without CSS errors
- [ ] shadcn `Button` can be imported from `@/components/ui/button` and renders with correct styles
- [ ] Old CSS files (`styles.css`, `auth-layout.css`) are deleted
- [ ] No `.dark` CSS block present in `globals.css`
- [ ] Existing tests still pass (no functional change)

## Blocked by

None — can start immediately
