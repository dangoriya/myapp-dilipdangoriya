#!/bin/sh
# Entrypoint script for MyApp Docker container

set -e

# Database path (matches volume mount in docker-compose.yml)
export DB_PATH="/app/db/app.db"

# Initialize volume from image copy if empty (first run)
if [ ! -f "$DB_PATH" ]; then
  echo "📦 Initializing database volume from image..."
  mkdir -p /app/db
  cp /app/db-initial/app.db "$DB_PATH"
fi

# Run migrations if RESET_DB=true
if [ "$RESET_DB" = "true" ]; then
  echo "🔄 RESET_DB=true — running database migrations..."
  npx tsx scripts/migrate.ts
else
  echo "⏭  RESET_DB=false — skipping migrations (preserving existing data)"
fi

# Start the Next.js application
exec node server.js