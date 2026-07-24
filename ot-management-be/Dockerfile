# syntax=docker/dockerfile:1

# ---- Build + runtime image for the NestJS API ----
# Debian slim keeps Prisma (schema engine / OpenSSL) and bcrypt native builds happy.
FROM node:22-slim

ENV PNPM_HOME=/pnpm
ENV PATH="/pnpm:$PATH"

# corepack -> pnpm, plus openssl for the Prisma migration engine.
RUN corepack enable \
  && corepack prepare pnpm@9.15.0 --activate \
  && apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first (better layer caching). NODE_ENV is left unset here so
# devDependencies (nest cli, ts-node, prisma) are available for build/migrate/seed.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# App source + generate client + compile.
COPY . .
RUN pnpm prisma generate && pnpm build

RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
