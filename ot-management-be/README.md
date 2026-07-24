# OT Management — Backend API

NestJS 11 + Prisma 7 + PostgreSQL 16 REST API for overtime (OT) registration and viewing.

## Tech stack

- **NestJS 11** (Express) — Controller → Service → Repository
- **Prisma 7** with `@prisma/adapter-pg` over a `pg` pool
- **PostgreSQL 16** (Docker)
- **JWT** access + refresh tokens (`@nestjs/jwt` + `passport-jwt`), bcrypt hashing with refresh-token rotation
- `class-validator` DTOs, global response envelope + exception filter, `@nestjs/throttler`, `helmet`
- Forgot-password OTP via `cache-manager` + `nodemailer` (logs the code to the console when no SMTP is configured)

## Getting started

### With Docker (recommended)

From the repo root a single compose file runs Postgres + API + web:

```bash
docker compose up -d --build      # API on http://localhost:5000/api
```

The API container applies Prisma migrations on start. Set `RUN_SEED=true` (in the root `.env`)
to also insert demo users on first boot.

### Local dev

```bash
pnpm install
cp .env.example .env               # adjust if needed (DB_PORT defaults to 5434)
docker compose up -d               # Postgres only (this folder's compose)
pnpm prisma:generate
pnpm prisma migrate dev
pnpm start:dev                     # http://localhost:5000/api
```

## API overview

All routes are prefixed with `/api`. Every response is wrapped as `{ status, message, data }`.

### Auth (`/auth`, public)

`POST signup` · `POST login` · `POST refresh-token` · `POST logout` · `POST forgot-password` · `POST verify-otp` · `POST reset-password`

Signup/login return `{ accessToken, refreshToken, user }`.

### Overtime (`/overtimes`)

- `GET /overtimes/range?from=YYYY-MM-DD&to=YYYY-MM-DD` — all overtime registered in `[from, to)` across everyone (each record includes its owner: `id`, `name`, `email`)
- `POST /overtimes` — register OT for the current user (`hours` is computed server-side from `startTime`/`endTime`)
- `PATCH /overtimes/:id` — edit an OT record
- `DELETE /overtimes/:id` — delete an OT record

## Data model

- **User** — `email`, `password`, `name`, `avatar`, `refreshToken`
- **Overtime** — `userId`, `date`, `startTime`/`endTime` (`HH:mm`), `hours` (computed), `reason`

## Scripts

| Script | Description |
| ------ | ----------- |
| `pnpm start:dev` | Watch-mode dev server |
| `pnpm build` / `pnpm start:prod` | Compile / run production build |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma migrate dev` | Create & apply migrations |
| `pnpm prisma:seed` | Seed demo data |
| `pnpm prisma:studio` | Open Prisma Studio |
