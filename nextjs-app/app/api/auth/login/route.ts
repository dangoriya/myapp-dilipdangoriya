import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSession, verifyPassword, getSessionTTLHours } from "@/lib/session";
import { UserProfile, UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const db = getDb();
    const userRow = db.prepare("SELECT * FROM users WHERE LOWER(email) = ? AND is_active = 1").get(cleanEmail) as any;

    if (!userRow) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = verifyPassword(cleanPassword, userRow.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create session in SQLite
    const token = createSession(userRow.id);
    const ttlHours = getSessionTTLHours();
    const maxAgeSeconds = ttlHours * 60 * 60;

    const user: UserProfile = {
      id: `user-${userRow.id}`,
      name: userRow.name,
      email: userRow.email,
      role: (userRow.role === "admin" ? "admin-only" : userRow.role) as UserRole,
      avatar: userRow.avatar || "/images/profile.png",
      siteUrl: userRow.site_url || ""
    };

    const response = NextResponse.json({ user, message: "Logged in successfully" });

    // Set HttpOnly session cookie
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
