import crypto from "crypto";
import { getOIDCConfig } from "./oidc-types";
import { mapAuthServerRoles } from "./role-mapping";
import { getSessionTTLHours } from "./session";
import { UserRole } from "@/types";

let jwksCache: { keys: any[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL_MS = 3600000;

function base64URLEncode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64URLDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return hash.toString("base64url");
}

export function generateState(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function buildAuthUrl(params: { state: string; codeChallenge?: string; codeChallengeMethod?: string }): string {
  const config = getOIDCConfig();
  const url = new URL(`${config.authServerUrl}/authorize`);
  
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", params.state);
  
  if (config.usePkce && params.codeChallenge) {
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", params.codeChallengeMethod || "S256");
  }
  
  return url.toString();
}

export async function exchangeCodeForTokens(code: string, codeVerifier?: string): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const config = getOIDCConfig();
  
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  
  if (config.usePkce && codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }
  
  const response = await fetch(`${config.authServerInternalUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${error}`);
  }
  
  const data = await response.json() as {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function fetchJWKS(): Promise<any[]> {
  const config = getOIDCConfig();
  const now = Date.now();
  
  if (jwksCache && now - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }
  
  const response = await fetch(`${config.authServerInternalUrl}/jwks.json`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }
  
  const data = await response.json() as { keys: any[] };
  jwksCache = { keys: data.keys, fetchedAt: now };
  
  return data.keys;
}

function parseJWTHeader(token: string): { kid?: string; alg?: string } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  return JSON.parse(base64URLDecode(parts[0]));
}

function parseJWTPayload<T>(token: string): T {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  return JSON.parse(base64URLDecode(parts[1])) as T;
}

export async function verifyToken(token: string, expectedAudience: string): Promise<any> {
  const header = parseJWTHeader(token);
  const payload = parseJWTPayload<any>(token);
  
  const keys = await fetchJWKS();
  const key = keys.find((k) => k.kid === header.kid);
  
  if (!key) {
    throw new Error(`No matching key found for kid: ${header.kid}`);
  }
  
  // Convert JWK to PEM - JWK n and e are base64url encoded
  function base64UrlToBase64(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    return base64 + padding;
  }
  
  const n = base64UrlToBase64(key.n);
  const e = base64UrlToBase64(key.e);
  
  // Create PEM format public key
  const publicKey = `-----BEGIN PUBLIC KEY-----
${Buffer.from(n, "base64").toString("base64").match(/.{1,64}/g)?.join("\n")}
-----END PUBLIC KEY-----`;
  
  // Actually, we need to use crypto.createPublicKey with JWK format
  const publicKeyObj = crypto.createPublicKey({
    key: {
      kty: "RSA",
      n: key.n,
      e: key.e,
    },
    format: "jwk",
  });
  
  const parts = token.split(".");
  const signingInput = `${parts[0]}.${parts[1]}`;
  const signature = Buffer.from(parts[2].replace(/-/g, "+").replace(/_/g, "/"), "base64");
  
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(signingInput);
  verify.end();
  
  if (!verify.verify(publicKeyObj, signature)) {
    throw new Error("Invalid token signature");
  }
  
  if (payload.iss !== config.authServerUrl.replace(/\/$/, "")) {
    throw new Error(`Invalid issuer: ${payload.iss}`);
  }
  
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(expectedAudience)) {
    throw new Error(`Invalid audience: ${payload.aud}`);
  }
  
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }
  
  return payload;
}

const config = getOIDCConfig();

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  
  const response = await fetch(`${config.authServerInternalUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${error}`);
  }
  
  const data = await response.json() as {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function fetchUserInfo(accessToken: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
}> {
  const config = getOIDCConfig();
  
  const response = await fetch(`${config.authServerInternalUrl}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Userinfo fetch failed: ${response.status}`);
  }
  
  return response.json() as Promise<{
    sub: string;
    email: string;
    name: string;
    picture?: string;
    roles: string[];
  }>;
}

export function buildLogoutUrl(idTokenHint?: string): string {
  const config = getOIDCConfig();
  const url = new URL(`${config.authServerUrl}/logout`);
  
  if (idTokenHint) {
    url.searchParams.set("id_token_hint", idTokenHint);
  } else {
    url.searchParams.set("client_id", config.clientId);
  }
  
  url.searchParams.set("post_logout_redirect_uri", config.postLogoutRedirectUri);
  
  return url.toString();
}

export function createSessionFromTokens(
  accessToken: string,
  idToken: string,
  refreshToken: string | undefined,
  expiresIn: number
): {
  type: "oidc";
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    siteUrl?: string;
  };
} {
  const accessPayload = parseJWTPayload<any>(accessToken);
  const idPayload = parseJWTPayload<any>(idToken);
  
  const roles = accessPayload.roles || idPayload.roles || [];
  const role = mapAuthServerRoles(roles);
  
  return {
    type: "oidc",
    idToken,
    refreshToken,
    expiresAt: Date.now() + getSessionTTLHours() * 3600 * 1000,
    user: {
      id: accessPayload.sub || idPayload.sub,
      name: accessPayload.name || idPayload.name || "Unknown",
      email: accessPayload.email || idPayload.email || "",
      role,
      avatar: idPayload.picture,
      siteUrl: "",
    },
  };
}