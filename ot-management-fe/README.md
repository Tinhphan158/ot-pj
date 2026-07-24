# OT Management — Frontend

Next.js 16 (App Router) web client for the OT Management system — overtime registration and viewing by day, week, month and year.

## Tech stack

- **Next.js 16** App Router + **React 19**
- **Tailwind CSS v4** (CSS-first theme) + **shadcn/ui** (new-york, neutral) — light & dark aware
- **TanStack React Query v5** for server state
- **react-hook-form** + **Zod v4** for forms/validation
- **Zustand** (persisted) for the auth session
- **axios** client with Bearer injection + one-shot 401 refresh
- Route protection via `proxy.ts` (a cookie gate)

## Getting started

> Start the backend first (see `../ot-management-be`) — it must be reachable at `http://localhost:5000/api`.

```bash
# 1. Install
pnpm install

# 2. Environment
cp .env.example .env.local   # NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api

# 3. Run
pnpm dev                     # http://localhost:3002
```

Or run the whole stack (Postgres + API + web) with Docker from the repo root: `docker compose up -d --build`.

## Features

- Login, register, forgot-password (OTP) & reset-password
- **Overtime management** (`/team-overtime`): register / edit / delete overtime via a drawer form
- Four ways to view everyone's overtime:
  - **Day** — timeline of who worked OT and in which time slots (picked via a date picker)
  - **Week** — per-day timelines for the week
  - **Month** — a User × day matrix (heatmap of hours per person per day)
  - **Year** — a User × month matrix (heatmap of hours per person per month)
- Your own rows/records are highlighted across every view.

## Project structure

```
src/
  app/                     App Router — (auth) & (content) route groups + proxy.ts
  config/                  env
  features/
    auth/                  store, schemas, mutation hooks, page-flow screens
    overtime/              components (day/week/month/year views, dialog, form), hooks (queries/mutations + actions), schemas, pages, utils
  lib/                     http (axios) + react-query client
  shared/
    api/                   services, query keys, api paths, entity types
    components/            ui (shadcn) + custome (App* wrappers) + layout
    providers/             AppProvider
    utils/                 cn, format, notify, api-error, auth-cookie
```

### Conventions

- Feature hooks split into `queries/` + `mutations/` subfolders; an `useOvertimeActions` orchestrator drives the drawer.
- Components use **named** exports; feature pages use **default** exports.
- React Query defaults `refetchOnMount: false`, so cross-view cache invalidation uses `refetchType: 'all'`.

## Scripts

| Script | Description |
| ------ | ----------- |
| `pnpm dev` | Dev server on port 3002 |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | Lint |
