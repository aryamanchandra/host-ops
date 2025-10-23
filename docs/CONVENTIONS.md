# Conventions

Developer conventions for Domainbase.

## Auth

All protected API routes use `requireAuth(request)` from [../src/lib/api-auth.ts](../src/lib/api-auth.ts):

```ts
const auth = requireAuth(request);
if (auth instanceof NextResponse) return auth;
// auth.userId, auth.username
```

- Do not hand-roll `Authorization` header parsing in routes — centralize via `requireAuth` / `getAuth`.
- Tokens are JWT in `localStorage`, sent as `Bearer <token>`.
- `JWT_SECRET` is **required** (no fallback) — see [../src/lib/env.ts](../src/lib/env.ts).

## Org scoping (multi-tenant)

- Data is moving from per-`userId` ownership to per-`orgId`. New tenant documents carry **both** `userId` (creator) and `orgId` (tenant).
- Scope every tenant query by the caller's current org once multi-tenant lands; keep `userId` for attribution.
- The current org is resolved from the `x-org-id` header alongside the Bearer token.

## Sanitization (XSS)

- Any author- or visitor-supplied HTML rendered to the DOM MUST pass through `sanitizeHtml` from [../src/lib/sanitize.ts](../src/lib/sanitize.ts) — on both server and client.
- Applies to: subdomain content, page-builder blocks, markdown output, form field rendering.

## Public endpoints

- Public write endpoints (`/api/analytics/track`, `/api/links/redirect/[slug]`, future form submissions) must pass through `rateLimit` from [../src/lib/rate-limit.ts](../src/lib/rate-limit.ts).

## Indexes

- Add new collection indexes to [../scripts/setup.ts](../scripts/setup.ts) (`npm run setup`). Never rely on unindexed queries for hot paths.
