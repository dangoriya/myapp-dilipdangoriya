import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createLocalSession, verifyPassword, getSessionTTLHours } from "@/lib/session";
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

    const token = createLocalSession(userRow.id);
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

    // Store session in JSON format expected by parseSessionToken
    const sessionCookieValue = JSON.stringify({
      type: "local",
      token,
      userId: userRow.id,
      expiresAt: Date.now() + maxAgeSeconds * 1000,
    });

    const response = NextResponse.json({ user, message: "Logged in successfully" });

    response.cookies.set("session", sessionCookieValue, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (err: any) {
    console.error("Local login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}