export type AuthFlow = "local" | "oidc";

let cachedAuthFlow: AuthFlow | null = null;

export function getAuthFlow(): AuthFlow {
  if (cachedAuthFlow) return cachedAuthFlow;
  const flow = (process.env.AUTH_FLOW as AuthFlow) || "oidc";
  if (flow !== "local" && flow !== "oidc") {
    console.warn(`Invalid AUTH_FLOW: ${flow}, defaulting to "oidc"`);
    cachedAuthFlow = "oidc";
  } else {
    cachedAuthFlow = flow;
  }
  return cachedAuthFlow;
}

export function isOIDCEnabled(): boolean {
  return getAuthFlow() === "oidc";
}

export function isLocalAuthEnabled(): boolean {
  return getAuthFlow() === "local";
}

export function clearAuthFlowCache(): void {
  cachedAuthFlow = null;
}