import { getDb } from "./db";
import crypto from "crypto";
import { UserProfile, UserRole } from "@/types";

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

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export interface LocalSessionData {
  type: "local";
  token: string;
  userId: number;
  expiresAt: number;
}

export interface OIDCSessionData {
  type: "oidc";
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    siteUrl?: string;
  };
}

export type SessionData = LocalSessionData | OIDCSessionData;

export function createLocalSession(userId: number): string {
  const db = getDb();
  const token = crypto.randomUUID();
  const ttlHours = getSessionTTLHours();

  db.prepare("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')").run();

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, datetime('now', '+' || ? || ' hours'))
  `).run(token, userId, ttlHours);

  return token;
}

export function parseSessionToken(token: string): SessionData | null {
  if (!token) return null;

  try {
    const parsed = JSON.parse(token);
    if (parsed.type === "oidc" && parsed.idToken) {
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        return parsed as OIDCSessionData;
      }
      return null;
    }
    if (parsed.type === "local" && parsed.token) {
      return parsed as LocalSessionData;
    }
  } catch {
    return null;
  }
  return null;
}

export function getSession(token: string): UserProfile | null {
  if (!token) return null;

  const sessionData = parseSessionToken(token);
  if (!sessionData) return null;

  if (sessionData.type === "oidc") {
    if (sessionData.expiresAt <= Date.now()) {
      return null;
    }
    return {
      id: sessionData.user.id,
      name: sessionData.user.name,
      email: sessionData.user.email,
      role: sessionData.user.role,
      avatar: sessionData.user.avatar || "/images/profile.png",
      siteUrl: sessionData.user.siteUrl || "",
    };
  }

  const db = getDb();
  const row = db.prepare(`
    SELECT 
      s.id as session_id, s.expires_at,
      u.id as user_id, u.name, u.email, u.role, u.avatar, u.site_url, u.is_active
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND datetime(s.expires_at) > datetime('now') AND u.is_active = 1
  `).get(sessionData.token) as any;

  if (!row) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionData.token);
    return null;
  }

  return {
    id: `user-${row.user_id}`,
    name: row.name,
    email: row.email,
    role: (row.role === "admin" ? "admin-only" : row.role) as UserRole,
    avatar: row.avatar || "/images/profile.png",
    siteUrl: row.site_url || "",
  };
}

export function deleteSession(token: string): void {
  if (!token) return;

  const sessionData = parseSessionToken(token);
  if (!sessionData) return;

  if (sessionData.type === "local") {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionData.token);
  }
}

export function createOIDCSessionCookie(
  idToken: string,
  refreshToken: string | undefined,
  expiresIn: number
): string {
  const sessionData: OIDCSessionData = {
    type: "oidc",
    idToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
    user: {} as any,
  };
  return JSON.stringify(sessionData);
}