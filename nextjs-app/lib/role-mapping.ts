import { UserRole } from "@/types";

export interface RoleMappingConfig {
  mapping: Record<string, UserRole>;
  defaultRole: UserRole;
}

let cachedConfig: RoleMappingConfig | null = null;

export function getRoleMappingConfig(): RoleMappingConfig {
  if (cachedConfig) return cachedConfig;

  const mappingEnv = process.env.ROLE_MAPPING;
  const defaultRoleEnv = process.env.DEFAULT_ROLE as UserRole | undefined;

  let mapping: Record<string, UserRole> = {
    admin: "admin-only",
    administrator: "admin-only",
    superadmin: "admin-only",
    user: "normal-user",
    member: "normal-user",
    "normal-user": "normal-user",
  };

  if (mappingEnv) {
    try {
      const parsed = JSON.parse(mappingEnv);
      if (typeof parsed === "object" && parsed !== null) {
        mapping = parsed as Record<string, UserRole>;
      }
    } catch (e) {
      console.warn("Invalid ROLE_MAPPING JSON, using defaults:", e);
    }
  }

  const defaultRole: UserRole = defaultRoleEnv || "normal-user";

  cachedConfig = { mapping, defaultRole };
  return cachedConfig;
}

export function mapAuthServerRoles(authServerRoles: string[]): UserRole {
  const { mapping, defaultRole } = getRoleMappingConfig();

  if (!authServerRoles || authServerRoles.length === 0) {
    return defaultRole;
  }

  for (const role of authServerRoles) {
    const mapped = mapping[role.toLowerCase()];
    if (mapped) return mapped;
  }

  return defaultRole;
}

export function clearRoleMappingCache(): void {
  cachedConfig = null;
}