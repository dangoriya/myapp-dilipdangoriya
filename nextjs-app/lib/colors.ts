/**
 * Color utility functions for dynamic card gradient styling
 */

/**
 * Converts Hex color string to RGBA string with custom opacity alpha
 * @param hex Hex color string (e.g., #10b981 or #fff)
 * @param alpha Opacity value between 0 and 1
 * @returns Formatted RGBA string e.g. "rgba(16, 185, 129, 0.28)"
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
    if (!hex) return `rgba(56, 189, 248, ${alpha})`;
    let c = hex.replace("#", "");
    if (c.length === 3) {
        c = c.split("").map((x) => x + x).join("");
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
