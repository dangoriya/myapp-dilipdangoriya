# Frontend Local Development & Setup Guide

This document provides a step-by-step setup guide to run and test the frontend application locally on a fresh development machine.

---

## 📋 Prerequisites

- **Node.js**: v20.x (LTS recommended)
- **Package Manager**: `pnpm` v9.x (pinned for Node 20 compatibility)
- **Database**: SQLite3 (via `better-sqlite3` — no separate DB server needed)

---

## 🛠️ Step 1: Local Environment Setup

### 1. Install Node.js (via `nvm`)
If Node.js is not installed on your machine, install it via Node Version Manager (`nvm`):

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload terminal environment
source ~/.bashrc

# Install & use Node 20
nvm install 20
nvm use 20
```

### 2. Install `pnpm` v9 globally
> **Note**: `pnpm@9` must be used with Node 20 to avoid `node:sqlite` module compatibility errors introduced in pnpm v10+.

```bash
npm install -g pnpm@9 --force
```

Verify installations:
```bash
node -v   # Should output v20.x.x
pnpm -v   # Should output 9.x.x
```

---

## 🚀 Step 2: Running the Nextjs App Locally

### 1. Navigate to the frontend directory
```bash
cd nextjs-app
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Variables Setup (.env)
The main `.env` file lives in the **project root** (one level up). For local development, create a symlink so Next.js can read it:

```bash
# From nextjs-app/ directory
ln -sf ../.env .env
```

This makes Next.js auto-load all settings from the root `.env` file (auth, database, session, etc.).

> **Note**: The root `.env` is created from `.env.example` at project setup:
> ```bash
> # From project root (one-time)
> cp .env.example .env
> # Edit .env with your local values
> ```

**Key local settings to verify in `.env`:**
- `AUTH_FLOW=local` (or `oidc` if you have auth server running)
- `APPLICATION_URL=http://localhost:3000`
- `REDIRECT_URI=http://localhost:3000/api/auth/callback`
- `POST_LOGOUT_REDIRECT_URI=http://localhost:3000`
- `SECURE_COOKIE=false`
- `DB_PATH=./db/app.db` (relative to nextjs-app)

### 4. Optional: External Backend URL
If you need a separate backend API, create `.env.local` (ignored by git/Docker):
```env
BACKEND_API_URL=http://localhost:8051
```

### 5. Start the development server
```bash
pnpm dev
```

The application will start at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## 🗄️ Step 3: Database Setup (SQLite)

This app uses **SQLite** via `better-sqlite3`. The database file lives at:
```
nextjs-app/db/app.db
```

> The `db/` folder is tracked in git (via `.gitkeep`), but `*.db` files are gitignored — every developer creates their own local database.

### 1. Run the migration script

From inside `nextjs-app/`, run:
```bash
pnpm migrate
```

Expected output:
```
  ✅ Applied   001_phase1_create_roles_and_users
  ✅ Applied   002_phase1_create_apps_and_sessions
  ✅ Applied   003_phase2_seed_roles_and_users
  ✅ Applied   004_phase2_seed_initial_apps

✔ 4 migration phase(s) executed successfully → /path/to/nextjs-app/db/app.db
```

Safe to re-run — already applied migrations are skipped:
```
  ⏭  Skipping  001_phase1_create_roles_and_users
  ...

✔ Database is already up to date.
```

### 2. Adding a new migration

Edit [`scripts/migrate.ts`](./scripts/migrate.ts) and append a new entry to the `migrations` array:
```ts
{
  version: "005_add_posts",
  up: `
    CREATE TABLE IF NOT EXISTS posts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      body       TEXT,
      user_id    INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `,
},
```
Then run `pnpm migrate` again.

> ⚠️ **Never edit an existing migration.** Add a new one instead to keep history safe.

### 3. Using the database in API Routes / Server Actions

```ts
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const users = db.prepare("SELECT * FROM users").all();
  return Response.json(users);
}
```

---

## 🧹 Troubleshooting Common Issues

### Issue 1: `EACCES: permission denied, open '.next/package.json'`
**Cause**: The `.next` directory was previously generated inside a Docker container or with `sudo` permissions.

**Fix**:
```bash
rm -rf .next node_modules
pnpm install
```

### Issue 2: `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` when running `pnpm`
**Cause**: `pnpm` v10+ was installed, which requires Node.js v22+.

**Fix**:
```bash
npm install -g pnpm@9 --force
```

### Issue 3: `SqliteError: table users has no column named role` when running `pnpm migrate`
**Cause**: A stale `db/app.db` exists from a previous (older) migration run with a different schema. The `migrations` table shows it as already applied, so the new schema is never re-created.

**Fix**: Since the database is fully seeded from migrations, safely delete and recreate it:
```bash
rm db/app.db && pnpm migrate
```

---

## 🐳 Docker Development (Optional)

If you prefer running via Docker Compose (uses same root `.env`):

```bash
# From project root
docker compose up -d

# View logs
docker logs -f myapp

# Stop
docker compose down
```

**Force database reset:**
```bash
docker compose down -v
RESET_DB=true docker compose up -d
```
