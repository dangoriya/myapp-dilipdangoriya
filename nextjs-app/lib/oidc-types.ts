export interface OIDCConfig {
  authServerUrl: string;
  authServerInternalUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scopes: string;
  usePkce: boolean;
}

export function getOIDCConfig(): OIDCConfig {
  const authServerUrl = process.env.AUTH_SERVER_URL || "http://localhost:8005";
  return {
    authServerUrl,
    authServerInternalUrl: process.env.AUTH_SERVER_INTERNAL_URL || authServerUrl,
    clientId: process.env.CLIENT_ID || "",
    clientSecret: process.env.CLIENT_SECRET || "",
    redirectUri: process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback",
    postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI || "http://localhost:3000/logged-out",
    scopes: process.env.OIDC_SCOPES || "openid profile email",
    usePkce: process.env.USE_PKCE !== "false",
  };
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
  scope: string;
}

export interface AccessTokenClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  client_id: string;
  scope: string;
  roles: string[];
  exp: number;
  iat: number;
  email: string;
  name: string;
  sid: string;
}

export interface IDTokenClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  auth_time: number;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
  sid: string;
}

export interface UserInfoResponse {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  roles: string[];
  is_admin: boolean;
  is_2fa_enabled: boolean;
}

export interface JWKSKey {
  kty: string;
  kid: string;
  use: string;
  n: string;
  e: string;
  alg: string;
}

export interface JWKSResponse {
  keys: JWKSKey[];
}

export interface AuthUrlParams {
  state: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export interface SessionData {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    siteUrl?: string;
  };
}