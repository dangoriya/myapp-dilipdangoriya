import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = getSession(token);
    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Auth check error:", err);
    return NextResponse.json({ user: null });
  }
}
