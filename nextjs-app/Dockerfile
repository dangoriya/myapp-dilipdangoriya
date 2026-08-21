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
# ─── Database Migration (SQLite) ─────────────────────────────────────────────
# Run migration before build so the DB exists during Next.js pre-rendering.
# If you switch to a different database (e.g. PostgreSQL), comment out this line.
RUN npx tsx scripts/migrate.ts
# ─────────────────────────────────────────────────────────────────────────────
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
# Copy the pre-built SQLite database (created during build by migrate.ts)
COPY --from=builder /app/db ./db

EXPOSE 3000
CMD ["node", "server.js"]