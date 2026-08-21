/**
 * Type definitions for DevHub App Workspace
 */

// Access level permission for applications
export type AccessLevel = 'all' | 'normal-user' | 'admin-only';

// User role type for access control and authentication simulation
export type UserRole = 'guest' | 'normal-user' | 'admin-only';

// Structure representing an Application Card in the gallery
export interface AppItem {
    id: string;
    title: string;
    description: string;
    link: string;
    icon: string;
    color: string; // Base Hex color used for dynamic gradient styling
    access: AccessLevel;
}

// User Profile structure
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    siteUrl: string;
}

// Color swatch preset for app creation
export interface ColorPreset {
    name: string;
    hex: string;
}

// Icon option preset for selection
export interface IconOption {
    id: string;
    label: string;
}
