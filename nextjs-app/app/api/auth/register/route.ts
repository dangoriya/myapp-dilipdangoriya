import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSession, hashPassword, getSessionTTLHours } from "@/lib/session";
import { UserProfile, UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanPassword.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const db = getDb();

    // Check existing email
    const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = hashPassword(cleanPassword);
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><rect width='100' height='100' rx='50' fill='%231e293b'/><path d='M50 18A19 19 0 1 0 50 56A19 19 0 1 0 50 18Z' fill='%2338bdf8'/><path d='M21 92C21 73 34 60 50 60C66 60 79 73 79 92Z' fill='%2338bdf8'/></svg>";

    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, avatar, site_url)
      VALUES (?, ?, ?, 'normal-user', ?, '')
    `).run(cleanName, cleanEmail, hashedPassword, defaultAvatar);

    const newUserId = Number(result.lastInsertRowid);

    // Create server session
    const token = createSession(newUserId);
    const ttlHours = getSessionTTLHours();
    const maxAgeSeconds = ttlHours * 60 * 60;

    const user: UserProfile = {
      id: `user-${newUserId}`,
      name: cleanName,
      email: cleanEmail,
      role: "normal-user" as UserRole,
      avatar: defaultAvatar,
      siteUrl: ""
    };

    const response = NextResponse.json({ user, message: "Registered and logged in successfully" });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
