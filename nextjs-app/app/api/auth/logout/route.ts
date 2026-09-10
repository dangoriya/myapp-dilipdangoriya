import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession, parseSessionToken } from "@/lib/session";
import { buildLogoutUrl } from "@/lib/oidc";
import { getAuthFlow } from "@/lib/auth-config";

function getBaseUrl(req: Request): string {
  // Check for proxy headers first (common in Docker/proxy setups)
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host");

  if (forwardedHost) {
    const proto = forwardedProto || "http";
    return `${proto}://${forwardedHost}`;
  }

  // Fallback to APPLICATION_URL env var if set
  if (process.env.APPLICATION_URL) {
    return process.env.APPLICATION_URL;
  }

  // Last resort: use request host (may be internal Docker address)
  if (host) {
    const proto = req.url.startsWith("https") ? "https" : "http";
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    const authFlow = getAuthFlow();
    const baseUrl = getBaseUrl(req);

    let redirectUrl: string;

    if (authFlow === "oidc") {
      let idTokenHint: string | undefined;

      if (token) {
        const sessionData = parseSessionToken(token);
        if (sessionData?.type === "oidc") {
          idTokenHint = sessionData.idToken;
        }
        deleteSession(token);
      }

      redirectUrl = buildLogoutUrl(idTokenHint);
    } else {
      if (token) {
        deleteSession(token);
      }
      redirectUrl = `${baseUrl}/`;
    }

    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("session", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err: any) {
    console.error("Logout error:", err);
    const baseUrl = getBaseUrl(req);
    const response = NextResponse.redirect(`${baseUrl}/`);
    response.cookies.set("session", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }
}