#!/bin/sh
set -e

# ─── Database Migration (SQLite) ──────────────────────────────────────────────
# Comment out these lines if you switch to a different database (e.g. PostgreSQL)
echo "Running database migrations..."
npx tsx scripts/migrate.ts

