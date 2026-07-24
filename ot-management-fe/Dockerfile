# syntax=docker/dockerfile:1

# ---- Build + run the Next.js app ----
FROM node:22-alpine

ENV PNPM_HOME=/pnpm
ENV PATH="/pnpm:$PATH"
# Never let corepack block the build waiting for a TTY confirmation prompt.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Next 16 / Turbopack build can be memory hungry — raise the heap ceiling.
ENV NODE_OPTIONS=--max-old-space-size=2048

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Install deps first (cached). Keep NODE_ENV unset so devDependencies
# (tailwind, typescript, eslint) are present for `next build`.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so the
# API URL the browser calls must be passed as a build arg.
ARG NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_APP_URL=http://localhost:3002
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3002

# package.json start script: next start -H 0.0.0.0 -p 3002
CMD ["pnpm", "start"]
