#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
pnpm prisma migrate deploy

# Seed demo data on first boot. Safe to leave on: it is idempotent-ish and any
# failure (e.g. rows already exist) is logged but does not stop the server.
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Seeding demo data (RUN_SEED=true)..."
  pnpm prisma:seed || echo "[entrypoint] Seed skipped/failed (data may already exist)."
fi

echo "[entrypoint] Starting API..."
exec node dist/main
