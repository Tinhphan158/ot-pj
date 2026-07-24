# syntax=docker/dockerfile:1

# ---- Build + runtime image for the NestJS API ----
# Debian slim keeps Prisma (schema engine / OpenSSL) and bcrypt native builds happy.
FROM node:22-slim

ENV PNPM_HOME=/pnpm
ENV PATH="/pnpm:$PATH"
# Never let corepack block the build waiting for a TTY confirmation prompt.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# corepack -> pnpm, plus openssl for the Prisma migration engine and
# build-essential/python3 so bcrypt can compile on any CPU arch if no prebuilt exists.
RUN corepack enable \
  && corepack prepare pnpm@9.15.0 --activate \
  && apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first (better layer caching). NODE_ENV is left unset here so
# devDependencies (nest cli, ts-node, prisma) are available for build/migrate/seed.
# The BuildKit cache mount keeps the pnpm store between builds, so a cancelled /
# retried install resumes from what was already downloaded instead of from zero.
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store

# App source + generate client + compile.
COPY . .
RUN pnpm prisma generate && pnpm build

RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
