import React, { CSSProperties } from "react";
import * as LucideIcons from "lucide-react";

interface SafeIconProps {
    name: string;
    size?: number;
    className?: string;
    style?: CSSProperties;
}

// Build a case-insensitive & normalized lookup map for all exported Lucide icons
const NORMALIZED_ICON_MAP: Record<string, React.ComponentType<LucideIcons.LucideProps>> = {};

Object.keys(LucideIcons).forEach((key) => {
    const comp = (LucideIcons as unknown as Record<string, React.ComponentType<LucideIcons.LucideProps>>)[key];
    if (typeof comp === "function" || (typeof comp === "object" && comp !== null)) {
        // Map original key lowercase
        NORMALIZED_ICON_MAP[key.toLowerCase()] = comp;
        // Map stripped key (without dashes, spaces, underscores)
        NORMALIZED_ICON_MAP[key.toLowerCase().replace(/[-_\s]/g, "")] = comp;
    }
});

/**
 * Converts any kebab-case, camelCase, or snake_case string from lucide.dev into PascalCase
 * e.g. "git-branch" -> "GitBranch", "trash-2" -> "Trash2", "save" -> "Save"
 */
export function normalizeIconName(name: string): string {
    if (!name) return "";
    return name
        .trim()
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^[a-z]/, (c) => c.toUpperCase());
}

/**
 * Type-safe Lucide icon component supporting any icon copied from lucide.dev/icons (kebab-case or PascalCase)
 */
export function SafeIcon({ name, size = 20, className = "", style = {} }: SafeIconProps) {
    if (!name || !name.trim()) {
        const Fallback = LucideIcons.AppWindow;
        return <Fallback size={size} className={className} style={style} />;
    }

    const cleanKey = name.trim().toLowerCase();
    const strippedKey = cleanKey.replace(/[-_\s]/g, "");

    // Lookup component by normalized key or fallback to AppWindow
    const Component =
        NORMALIZED_ICON_MAP[cleanKey] ||
        NORMALIZED_ICON_MAP[strippedKey] ||
        LucideIcons.AppWindow;

    return <Component size={size} className={className} style={style} />;
}
