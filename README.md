# Domainbase

A domain management platform: subdomain hosting, a link shortener, real-time
analytics, DNS/WHOIS tooling, uptime + SSL monitoring, and team workspaces.
Built with Next.js 14 (App Router), MongoDB, and the NameSilo API.

## Features

### Subdomain hosting
- **SSR pages** with per-subdomain `<title>`/OpenGraph/Twitter metadata and proper 404s
- **Three authoring modes** — raw HTML, **Markdown** (GFM, sanitized), and a **block page builder** (hero / text / image / button / divider / embed) with live preview
- **Template gallery** — start from landing / link-in-bio / coming-soon / docs / portfolio templates
- **Content versioning** — every edit is snapshotted; draft vs published, diff viewer, one-click rollback
- **Scheduled publish/unpublish** — go live / take down on a schedule (per-minute cron)
- **Redirect-only subdomains** — 301/302 to any destination
- **Form builder + submissions inbox** — configurable contact forms with spam guards (honeypot, min-fill-time, rate limit) and CSV export

### Link shortener
- Click tracking, **QR codes**, **UTM builder**, **link expiration**, **password-protected links**, and a **link-in-bio** page

### Analytics
- Privacy-light pageview tracking with accurate device/browser/OS (`ua-parser-js`)
- **Geo analytics** (IP → country/city) with a choropleth map + top countries
- **UTM campaign** breakdown (sources / mediums / campaigns)
- **Real-time dashboard** (SSE live visitors + recent events)
- **Live visitor map** — animated world map of recent hits

### Domain tooling
- DNS records manager, DNS checker, propagation map, WHOIS / domain info (NameSilo API)
- **SSL + health monitoring** — uptime + TLS cert expiry checks, history, alerts (email via Resend)

### Platform
- **Teams / multi-tenant** — organizations, roles (owner/admin/member), email invites, org switcher
- Google OAuth + JWT auth, dark mode, Vercel-inspired clean UI

## Tech stack

Next.js 14 · React 18 · TypeScript · MongoDB · CSS Modules · NameSilo API ·
recharts · react-simple-maps · react-markdown · isomorphic-dompurify · Resend

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run setup                # create MongoDB indexes
npm run dev
```

### Environment

See [.env.example](.env.example). Required: `MONGODB_URI`, `JWT_SECRET`,
`ROOT_DOMAIN`, `NEXT_PUBLIC_ROOT_DOMAIN`. Optional: NameSilo, Google OAuth,
`CRON_SECRET` (scheduled publish + monitor crons), `RESEND_API_KEY` + `ALERT_EMAIL`
(monitor alerts).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` / `build` / `start` | Next.js dev / production build / serve |
| `npm run setup` | Create MongoDB indexes ([scripts/setup.ts](scripts/setup.ts)) |
| `npm run migrate:orgs` | Backfill personal orgs + `orgId` onto existing data |
| `npm run test:smoke` / `test:ua` / `test:utm` | Lightweight unit/smoke tests |

## Scheduled jobs (Vercel cron)

Configured in [vercel.json](vercel.json):
- `/api/cron/publish-scheduler` (every minute) — flips scheduled subdomains live/down
- `/api/cron/monitor-checks` (every 5 min) — runs due uptime/SSL checks

Both are guarded by `CRON_SECRET`.

## Architecture

```
src/
├── app/
│   ├── (dashboard)/     # authed dashboard pages
│   ├── api/             # route handlers (auth, subdomains, links, analytics,
│   │                    #   orgs, monitors, submissions, cron, …)
│   ├── subdomain/[…]    # public SSR subdomain pages
│   ├── bio/[username]   # public link-in-bio pages
│   └── url/[slug]       # short-link redirect + password gate
├── components/          # UI (subdomains, analytics, links, monitors, …)
├── hooks/               # data hooks (useSubdomains, useOrg, useMonitors, …)
├── lib/                 # server libs (auth, mongodb, analytics, monitor, …)
├── helpers/ · types/ · styles/
└── middleware.ts        # *.ROOT_DOMAIN routing + reserved (bio/url) subdomains
```

Developer conventions live in [docs/CONVENTIONS.md](docs/CONVENTIONS.md).
