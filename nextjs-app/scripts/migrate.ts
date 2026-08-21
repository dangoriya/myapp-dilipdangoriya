/**
 * Database Migration Script
 *
 * Run this script to create/update the SQLite database schema.
 * Usage: pnpm migrate
 *
 * Each migration is identified by a unique version number.
 * Already-applied migrations are tracked in the `migrations` table and skipped.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.resolve(process.cwd(), "db/app.db");

// Ensure the db directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Bootstrap migrations tracking table ──────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    version    TEXT    NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT (datetime('now'))
  );
`);

// ─── Managed Migration Phases ──────────────────────────────────────────────────
const migrations: { version: string; title: string; up: (db: Database.Database) => void }[] = [
  // ── PHASE 1: Schema Architecture (Tables & Foreign Keys) ──────────────────────
  {
    version: "001_phase1_create_roles_and_users",
    title: "Phase 1: Roles, Users & Core Schema",
    up: (db) => {
      // 1. Roles table
      db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          name        TEXT    NOT NULL UNIQUE,
          label       TEXT    NOT NULL,
          description TEXT,
          sort_order  INTEGER NOT NULL DEFAULT 0,
          created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // 2. Users table
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          name       TEXT    NOT NULL,
          email      TEXT    NOT NULL UNIQUE,
          password   TEXT,
          role       TEXT    NOT NULL DEFAULT 'normal-user'
                     CHECK(role IN ('guest', 'normal-user', 'admin')),
          role_id    INTEGER REFERENCES roles(id),
          avatar     TEXT,
          site_url   TEXT,
          is_active  INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME NOT NULL DEFAULT (datetime('now')),
          updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        );
      `);
    },
  },

  {
    version: "002_phase1_create_apps_and_sessions",
    title: "Phase 1: Apps & Server Sessions Schema",
    up: (db) => {
      // 1. Apps table
      db.exec(`
        CREATE TABLE IF NOT EXISTS apps (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          title       TEXT    NOT NULL,
          description TEXT,
          link        TEXT    NOT NULL,
          icon        TEXT    NOT NULL DEFAULT 'Globe',
          color       TEXT    NOT NULL DEFAULT '#6366f1',
          access      TEXT    NOT NULL DEFAULT 'all'
                      CHECK(access IN ('all', 'normal-user', 'admin')),
          sort_order  INTEGER NOT NULL DEFAULT 0,
          is_active   INTEGER NOT NULL DEFAULT 1,
          created_at  DATETIME NOT NULL DEFAULT (datetime('now')),
          updated_at  DATETIME NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // 2. Server-side Sessions table
      db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id          TEXT PRIMARY KEY,
          user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at  DATETIME NOT NULL,
          created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
        );
      `);
    },
  },

  // ── PHASE 2: Seed Master Data & Credentials ─────────────────────────────
  {
    version: "003_phase2_seed_roles_and_users",
    title: "Phase 2: Seed Roles & Default Users",
    up: (db) => {
      // 1. Seed Roles
      const insertRole = db.prepare(`
        INSERT OR IGNORE INTO roles (name, label, description, sort_order)
        VALUES (@name, @label, @description, @sort_order)
      `);
      db.transaction(() => {
        insertRole.run({ name: "guest", label: "Guest", description: "Read-only access, no login required.", sort_order: 1 });
        insertRole.run({ name: "normal-user", label: "User", description: "Standard authenticated user.", sort_order: 2 });
        insertRole.run({ name: "admin", label: "Admin", description: "Full access including admin-only features.", sort_order: 3 });
      })();

      // 2. Seed Default Admin User
      const adminRoleId = (db.prepare("SELECT id FROM roles WHERE name = 'admin'").get() as any)?.id || null;
      db.prepare(`
        INSERT OR IGNORE INTO users (name, email, role, role_id, avatar, site_url, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "Dilip Dangoriya",
        "dilipdangoriya@gmail.com",
        "admin",
        adminRoleId,
        "/images/profile.png",
        "https://iprofile.com",
        "admin123"
      );

      // 3. Seed Default Normal User
      const userRoleId = (db.prepare("SELECT id FROM roles WHERE name = 'normal-user'").get() as any)?.id || null;
      db.prepare(`
        INSERT OR IGNORE INTO users (name, email, role, role_id, avatar, site_url, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "Normal User",
        "user@devhub.com",
        "normal-user",
        userRoleId,
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><rect width='100' height='100' rx='50' fill='%231e293b'/><path d='M50 18A19 19 0 1 0 50 56A19 19 0 1 0 50 18Z' fill='%2338bdf8'/><path d='M21 92C21 73 34 60 50 60C66 60 79 73 79 92Z' fill='%2338bdf8'/></svg>",
        "https://example.com",
        "user123"
      );
    },
  },

  {
    version: "004_phase2_seed_initial_apps",
    title: "Phase 2: Seed Showcase Applications",
    up: (db) => {
      const insertApp = db.prepare(`
        INSERT OR IGNORE INTO apps (title, description, link, icon, color, access, sort_order)
        VALUES (@title, @description, @link, @icon, @color, @access, @sort_order)
      `);

      const apps = [
        {
          title: "AI Studio",
          description: "Centralized launchpad, emerald and AI studio.",
          link: "https://aistudio.google.com",
          icon: "Bot",
          color: "#10b981",
          access: "all",
          sort_order: 1,
        },
        {
          title: "Source Control",
          description: "Centralized launchpad, source control.",
          link: "https://github.com",
          icon: "GitBranch",
          color: "#a855f7",
          access: "all",
          sort_order: 2,
        },
        {
          title: "Deploy Manager",
          description: "Centralized launchpad, deploy cloud manager.",
          link: "https://vercel.com",
          icon: "Cloud",
          color: "#06b6d4",
          access: "all",
          sort_order: 3,
        },
        {
          title: "Database Admin",
          description: "Centralized launchpad, database admin.",
          link: "https://supabase.com",
          icon: "Database",
          color: "#f59e0b",
          access: "normal-user",
          sort_order: 4,
        },
        {
          title: "Analytics Desk",
          description: "Centralized launchpad, analytics desk.",
          link: "https://analytics.google.com",
          icon: "BarChart3",
          color: "#f43f5e",
          access: "admin",
          sort_order: 5,
        },
      ];

      db.transaction((items: typeof apps) => {
        for (const app of items) insertApp.run(app);
      })(apps);
    },
  },
];

// ─── Apply Migrations ─────────────────────────────────────────────────────────
const applied = new Set(
  db.prepare("SELECT version FROM migrations").all().map((r: any) => r.version as string)
);

let count = 0;
for (const migration of migrations) {
  if (applied.has(migration.version)) {
    console.log(`  ⏭  Skipping  ${migration.version}`);
    continue;
  }

  db.transaction(() => {
    migration.up(db);
    db.prepare("INSERT INTO migrations (version) VALUES (?)").run(migration.version);
  })();

  console.log(`  ✅ Applied   ${migration.title} (${migration.version})`);
  count++;
}

db.close();

console.log(
  count === 0
    ? "\n✔ Database is up to date."
    : `\n✔ ${count} migration phase(s) executed successfully → ${DB_PATH}`
);
