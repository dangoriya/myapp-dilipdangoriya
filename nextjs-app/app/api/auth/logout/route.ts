import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
      deleteSession(token);
    }

    const response = NextResponse.json({ message: "Logged out successfully" });
    
    // Clear session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err: any) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
