import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession, parseSessionToken } from "@/lib/session";
import { buildLogoutFormData } from "@/lib/oidc";
import { getAuthFlow } from "@/lib/auth-config";
import { getOIDCConfig } from "@/lib/oidc-types";

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderAutoSubmitForm(actionUrl: string, fields: Record<string, string>): string {
  const inputs = Object.entries(fields)
    .map(
      ([key, val]) =>
        `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(val)}" />`
    )
    .join("\n        ");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Signing out...</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #0f172a;
        color: #e2e8f0;
      }
      .container {
        text-align: center;
      }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255,255,255,0.1);
        border-top-color: #38bdf8;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="spinner"></div>
      <p>Logging out...</p>
      <form id="logout-form" method="POST" action="${escapeHtml(actionUrl)}">
        ${inputs}
        <noscript>
          <button type="submit" style="padding: 8px 16px; cursor: pointer; background: #38bdf8; color: #0f172a; border: none; border-radius: 6px; font-weight: 600;">
            Click here if you are not redirected automatically
          </button>
        </noscript>
      </form>
    </div>
    <script>
      document.getElementById('logout-form').submit();
    </script>
  </body>
</html>`;
}

async function handleLogout(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    const authFlow = getAuthFlow();
    const baseUrl = getBaseUrl(req);

    if (authFlow === "oidc") {
      let idTokenHint: string | undefined;

      if (token) {
        const sessionData = parseSessionToken(token);
        if (sessionData?.type === "oidc") {
          idTokenHint = sessionData.idToken;
        }
        deleteSession(token);
      }

      if (idTokenHint) {
        const { url, fields } = buildLogoutFormData(idTokenHint);
        const html = renderAutoSubmitForm(url, fields);

        const response = new NextResponse(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });

        response.cookies.set("session", "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });

        return response;
      } else {
        const config = getOIDCConfig();
        const fallbackUrl = config.postLogoutRedirectUri || `${baseUrl}/`;
        const response = NextResponse.redirect(fallbackUrl);

        response.cookies.set("session", "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });

        return response;
      }
    } else {
      if (token) {
        deleteSession(token);
      }
      const response = NextResponse.redirect(`${baseUrl}/`);

      response.cookies.set("session", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });

      return response;
    }
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

export async function GET(req: Request) {
  return handleLogout(req);
}

export async function POST(req: Request) {
  return handleLogout(req);
}