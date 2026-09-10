import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  verifyToken,
  createSessionFromTokens,
} from "@/lib/oidc";
import { getOIDCConfig } from "@/lib/oidc-types";
import { getSessionTTLHours } from "@/lib/session";

function getAppUrl(req: Request): string {
  // Use APPLICATION_URL env var if set
  if (process.env.APPLICATION_URL) {
    return process.env.APPLICATION_URL;
  }
  // Fallback to request origin
  const requestUrl = new URL(req.url);
  return `${requestUrl.protocol}//${requestUrl.host}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const appUrl = getAppUrl(req);

    if (error) {
      console.error("OIDC authorization error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/?auth_error=${encodeURIComponent(errorDescription || error)}`, appUrl)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/?auth_error=missing_code_or_state", appUrl)
      );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("oidc_state")?.value;
    const codeVerifier = cookieStore.get("oidc_code_verifier")?.value;

    if (!storedState || storedState !== state) {
      console.error("Invalid OIDC state");
      return NextResponse.redirect(
        new URL("/?auth_error=invalid_state", appUrl)
      );
    }

    const config = getOIDCConfig();

    const { accessToken, idToken, refreshToken, expiresIn } = await exchangeCodeForTokens(
      code,
      config.usePkce ? codeVerifier : undefined
    );

    await verifyToken(accessToken, config.clientId);
    await verifyToken(idToken, config.clientId);

    const sessionData = createSessionFromTokens(accessToken, idToken, refreshToken, expiresIn);

    const maxAgeSeconds = getSessionTTLHours() * 3600;

    const response = NextResponse.redirect(new URL("/", appUrl));

    response.cookies.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    response.cookies.delete("oidc_state");
    response.cookies.delete("oidc_code_verifier");

    return response;
  } catch (err: any) {
    console.error("OIDC callback error:", err);
    const appUrl = getAppUrl(req);
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(err.message || "callback_failed")}`, appUrl)
    );
  }
}