FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ARG BACKEND_API_URL
ENV BACKEND_API_URL=$BACKEND_API_URL
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# ─── Database Migration Setup ─────────────────────────────────────────────────
# Scripts are copied so run-migration.sh can execute them at container startup.
# If you switch to a different database (e.g. PostgreSQL), comment out the
# two COPY lines below and remove the sh run-migration.sh call from entrypoint.sh.
COPY --from=builder /app/scripts ./scripts
COPY run-migration.sh ./run-migration.sh
RUN chmod +x run-migration.sh
# ─────────────────────────────────────────────────────────────────────────────

EXPOSE 3000
# Run migration first, then start the server
CMD sh run-migration.sh && node server.js