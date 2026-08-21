/**
 * SQLite Database Client (Singleton)
 *
 * Usage in Next.js API routes or Server Actions:
 *   import { getDb } from "@/lib/db";
 *   const db = getDb();
 *   const users = db.prepare("SELECT * FROM users").all();
 */

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "db/app.db");

// Singleton: reuse the same connection across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (!global.__db) {
    global.__db = new Database(DB_PATH);
    global.__db.pragma("journal_mode = WAL");
    global.__db.pragma("foreign_keys = ON");
  }
  return global.__db;
}

import { AppItem, UserProfile, AccessLevel, UserRole } from "@/types";

export function getAppsFromDb(): AppItem[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM apps WHERE is_active = 1 ORDER BY sort_order ASC, id ASC").all() as any[];
  
  return rows.map((row) => ({
    id: `app-${row.id}`,
    title: row.title,
    description: row.description || "",
    link: row.link,
    icon: row.icon,
    color: row.color,
    access: (row.access === "admin" ? "admin-only" : row.access) as AccessLevel,
  }));
}

export function getUsersFromDb(): Record<'guest' | 'user' | 'admin', UserProfile> {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM users WHERE is_active = 1").all() as any[];
  
  const defaultGuest: UserProfile = {
    id: "guest",
    name: "Dilip Dangoriya",
    email: "dilipdangoriya@gmail.com",
    role: "guest",
    avatar: "/images/profile.png",
    siteUrl: "https://iprofile.com"
  };

  const adminRow = rows.find(r => r.role === 'admin' || r.role === 'admin-only');
  const userRow = rows.find(r => r.role === 'normal-user') || adminRow;

  const user: UserProfile = userRow ? {
    id: `user-${userRow.id}`,
    name: userRow.name,
    email: userRow.email,
    role: (userRow.role === 'admin' ? 'admin-only' : userRow.role) as UserRole,
    avatar: userRow.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><rect width='100' height='100' rx='50' fill='%231e293b'/><path d='M50 18A19 19 0 1 0 50 56A19 19 0 1 0 50 18Z' fill='%2338bdf8'/><path d='M21 92C21 73 34 60 50 60C66 60 79 73 79 92Z' fill='%2338bdf8'/></svg>",
    siteUrl: userRow.site_url || "https://example.com"
  } : {
    id: "user-2",
    name: "Normal User",
    email: "user@devhub.com",
    role: "normal-user",
    avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><rect width='100' height='100' rx='50' fill='%231e293b'/><path d='M50 18A19 19 0 1 0 50 56A19 19 0 1 0 50 18Z' fill='%2338bdf8'/><path d='M21 92C21 73 34 60 50 60C66 60 79 73 79 92Z' fill='%2338bdf8'/></svg>",
    siteUrl: "https://example.com"
  };

  const admin: UserProfile = adminRow ? {
    id: `admin-${adminRow.id}`,
    name: adminRow.name,
    email: adminRow.email,
    role: "admin-only",
    avatar: adminRow.avatar || "/images/profile.png",
    siteUrl: adminRow.site_url || "https://iprofile.com"
  } : {
    id: "admin-1",
    name: "Admin Developer",
    email: "admin@iprofile.com",
    role: "admin-only",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    siteUrl: "https://admin.iprofile.com"
  };

  return {
    guest: defaultGuest,
    user,
    admin
  };
}

