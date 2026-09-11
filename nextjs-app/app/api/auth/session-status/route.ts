import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSessionToken, getSession } from "@/lib/session";
import { checkSessionActive } from "@/lib/oidc";
import { getAuthFlow } from "@/lib/auth-config";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ active: false, authenticated: false }, { status: 200 });
    }

    const sessionData = parseSessionToken(token);
    if (!sessionData) {
      const response = NextResponse.json(
        { active: false, authenticated: false, reason: "invalid_session" },
        { status: 200 }
      );
      response.cookies.set("session", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      return response;
    }

    const authFlow = getAuthFlow();

    if (sessionData.type === "oidc" && authFlow === "oidc") {
      // Check local expiration first
      if (sessionData.expiresAt && sessionData.expiresAt <= Date.now()) {
        const response = NextResponse.json(
          { active: false, authenticated: false, reason: "expired" },
          { status: 200 }
        );
        response.cookies.set("session", "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });
        return response;
      }

      // Check real-time active status against auth_server with id_token
      const result = await checkSessionActive(sessionData.idToken);

      if (!result.active) {
        // SSO session revoked on auth_server (401/403)
        const response = NextResponse.json(
          { active: false, authenticated: false, reason: "revoked" },
          { status: 200 }
        );
        response.cookies.set("session", "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });
        return response;
      }

      return NextResponse.json(
        { active: true, authenticated: true, type: "oidc" },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
          },
        }
      );
    }

    // Local authentication fallback
    const user = getSession(token);
    if (!user) {
      const response = NextResponse.json(
        { active: false, authenticated: false, reason: "invalid_local_session" },
        { status: 200 }
      );
      response.cookies.set("session", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      return response;
    }

    return NextResponse.json(
      { active: true, authenticated: true, type: "local" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err: any) {
    console.error("Session status check error:", err);
    // On unexpected server error, return fail-safe active: true if session exists to prevent UI churn
    return NextResponse.json({ active: true, authenticated: true, error: true }, { status: 200 });
  }
}
