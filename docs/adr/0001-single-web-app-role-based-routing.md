# ADR 0001 — Single Web App with Role-Based Routing

**Status:** Accepted

## Context

The take-home requires two UI views: a Seller view (upload, see status) and an Admin view (list documents, filter by status). The spec explicitly allows either a single app with role-based routing or two separate apps.

## Decision

One React app (`apps/web`) with two protected route groups:

- `/_seller/*` — accessible only to users with `role === 'seller'`
- `/_admin/*` — accessible only to users with `role === 'admin'`

Login is shared. After authentication, the app reads `role` from the JWT response and redirects to the appropriate group.

## Consequences

- One deploy target (Vercel), one `VITE_API_URL` to configure.
- Role enforcement is client-side routing only; server-side enforcement remains in the API via `RolesGuard`.
- Adding a third role in the future requires extending route group logic, but is not a rewrite.

## Rejected Alternative

Two separate apps (`apps/seller`, `apps/admin`). Rejected because it doubles deployment targets, environment variable management, and build configuration for no benefit at take-home scope.
