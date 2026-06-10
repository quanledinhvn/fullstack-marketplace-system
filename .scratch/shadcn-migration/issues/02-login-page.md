Status: ready-for-agent

# 02 — Login page

## What to build

Migrate the login page to Tailwind + shadcn. Replace the current custom-CSS `LoginForm` and `AuthLayout` with shadcn components. Add `react-hook-form` for form state management, wired to the existing Zod schema.

- Add `react-hook-form` and `@hookform/resolvers` dependencies
- Install shadcn components: `card`, `form`, `input`, `button`, `label`
- Rewrite `LoginForm` using shadcn `Card`, `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`, `Input`, `Button` — connected to the existing Zod login schema via `zodResolver`
- Rewrite `AuthLayout` using Tailwind utility classes (remove `auth-layout.css` import — handled by slice 01)
- Update component tests to use new DOM structure (queries against shadcn-rendered elements)

## Acceptance criteria

- [ ] `/login` renders correctly with shadcn Card, labeled inputs, and submit button
- [ ] Form validation (empty fields, invalid email) shows inline `FormMessage` errors
- [ ] Successful login navigates to the correct route (existing behavior preserved)
- [ ] All existing `LoginForm` tests pass (updated selectors as needed)

## Blocked by

- `01-foundation.md`
