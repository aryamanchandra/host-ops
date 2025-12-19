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

## Analytics: user-agent classification

- `parseUserAgent` in [../src/lib/userAgent.ts](../src/lib/userAgent.ts) (wrapping `ua-parser-js`) is the **single source of truth** for device/browser/OS classification. Do not hand-roll UA substring matching.
- It normalizes to the canonical labels: device `Desktop|Mobile|Tablet|Other`, browser `Chrome|Safari|Firefox|Edge`, OS `Windows|macOS|iOS|Android|Linux`, plus major `browserVersion`/`osVersion`.
- Legacy pageviews recorded before this change lack version fields; aggregations bucket them as `Unknown`.
- Classification rules are locked by [../src/lib/__tests__/userAgent.test.ts](../src/lib/__tests__/userAgent.test.ts) (`npm run test:ua`).

## Analytics: UTM campaign tracking

- The subdomain `AnalyticsTracker` sends the full `landingUrl` to `/api/analytics/track`.
- `parseUtmParams` in [../src/lib/utm.ts](../src/lib/utm.ts) extracts the standard tags and persists them on each pageview:

  | Param | Field |
  |-------|-------|
  | `utm_source` | `utmSource` |
  | `utm_medium` | `utmMedium` |
  | `utm_campaign` | `utmCampaign` |
  | `utm_term` | `utmTerm` |
  | `utm_content` | `utmContent` |

- Values are capped at 200 chars; empty params are dropped (never stored as `undefined`).
- `getAnalytics` aggregates `topSources` / `topMediums` / `topCampaigns`, rendered by `CampaignBreakdown`.
- Parsing rules are locked by [../src/lib/__tests__/utm.test.ts](../src/lib/__tests__/utm.test.ts) (`npm run test:utm`).

## Analytics: live dashboard (SSE)

- `GET /api/analytics/[subdomain]/live` streams Server-Sent Events. Each frame is `data: <LiveAnalytics JSON>\n\n`, pushed every 5s.
- `LiveAnalytics` = `{ activeVisitors, viewsInWindow, windowSeconds, recentEvents[] }`; the window is `LIVE_WINDOW_SECONDS` (300s) in [../src/lib/analytics.ts](../src/lib/analytics.ts).
- Auth: EventSource can't set headers, so the JWT is passed as `?token=`; `getAuth` accepts header **or** query token.
- Client `useLiveAnalytics` reconnects with backoff, pauses on hidden tab, and falls back to `?poll=1` JSON snapshots when EventSource is unavailable.
