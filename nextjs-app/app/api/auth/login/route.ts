import { NextResponse } from "next/server";
import { getAuthFlow } from "@/lib/auth-config";

export async function GET() {
  const authFlow = getAuthFlow();

  if (authFlow === "local") {
    return NextResponse.redirect(new URL("/auth/local-login", process.env.PUBLIC_BASE_URL || "http://localhost:3000"));
  }

  // OIDC flow
  const { buildAuthUrl, generateState, generateCodeVerifier, generateCodeChallenge } = await import("@/lib/oidc");

  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const authUrl = buildAuthUrl({
      state,
      codeChallenge,
      codeChallengeMethod: "S256",
    });

    const response = NextResponse.redirect(authUrl);

    response.cookies.set("oidc_state", state, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    response.cookies.set("oidc_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (err: any) {
    console.error("Login redirect error:", err);
    return NextResponse.json({ error: "Failed to initiate login" }, { status: 500 });
  }
}