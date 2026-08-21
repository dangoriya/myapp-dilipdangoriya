import { getDb } from "./db";
import crypto from "crypto";
import { UserProfile, UserRole } from "@/types";

// Default TTL: 3 hours, configurable via SESSION_TTL_HOURS environment variable
const DEFAULT_TTL_HOURS = 3;

export function getSessionTTLHours(): number {
  const envVal = process.env.SESSION_TTL_HOURS;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_TTL_HOURS;
}

// Password Hashing Utility using Node built-in crypto (pbkdf2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // Fallback for plain-text legacy passwords in DB
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export function createSession(userId: number): string {
  const db = getDb();
  const token = crypto.randomUUID();
  const ttlHours = getSessionTTLHours();

  // Clean up any existing expired sessions
  db.prepare("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')").run();

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, datetime('now', '+' || ? || ' hours'))
  `).run(token, userId, ttlHours);

  return token;
}

export function getSession(token: string): UserProfile | null {
  if (!token) return null;
  const db = getDb();

  // Find session joined with user
  const row = db.prepare(`
    SELECT 
      s.id as session_id, s.expires_at,
      u.id as user_id, u.name, u.email, u.role, u.avatar, u.site_url, u.is_active
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND datetime(s.expires_at) > datetime('now') AND u.is_active = 1
  `).get(token) as any;

  if (!row) {
    // Delete if expired session row exists
    db.prepare("DELETE FROM sessions WHERE id = ?").run(token);
    return null;
  }

  return {
    id: `user-${row.user_id}`,
    name: row.name,
    email: row.email,
    role: (row.role === "admin" ? "admin-only" : row.role) as UserRole,
    avatar: row.avatar || "/images/profile.png",
    siteUrl: row.site_url || ""
  };
}

export function deleteSession(token: string): void {
  if (!token) return;
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE id = ?").run(token);
}
