Status: ready-for-agent

# 03 — Dashboard layout

## What to build

Migrate `DashboardLayout` from custom CSS to Tailwind utility classes. Replace styled logout and user menu elements with shadcn `Button`.

- Rewrite `DashboardLayout` using Tailwind classes for the header, nav area, and main content region — remove all references to custom CSS class names
- Logout button → shadcn `Button` with `variant="ghost"`
- User identity display (email/name in header) → plain Tailwind-styled span, no shadcn component needed
- Update layout tests to reflect new DOM structure

## Acceptance criteria

- [ ] Dashboard header renders with correct layout at all viewport widths used in the prototype
- [ ] Logout button is a shadcn `Button` (ghost variant) and triggers logout on click
- [ ] No references to old custom CSS class names remain in the component
- [ ] All existing `DashboardLayout` tests pass (updated selectors as needed)

## Blocked by

- `01-foundation.md`
