"use client";

import React from "react";
import { SafeIcon } from "./IconHelper";

// Helper function to convert Hex color to RGBA
function hexToRgba(hex, alpha = 1) {
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

export default function AppCard({ app, userRole }) {
    const mainColor = app.color || "#10b981";

    // Dynamic style variables for gradient effect
    const cardStyle = {
        "--card-border": hexToRgba(mainColor, 0.3),
        "--card-gradient": `radial-gradient(circle at 20% 20%, ${hexToRgba(mainColor, 0.28)} 0%, rgba(17, 20, 32, 0.95) 70%)`,
        "--card-glow": hexToRgba(mainColor, 0.35),
        "--icon-bg": hexToRgba(mainColor, 0.18),
        "--theme-color": mainColor,
    };

    return (
        <div className="app-card" style={cardStyle}>
            {userRole === "admin-only" && app.access !== "all" && (
                <span className="access-badge">
                    {app.access === "admin-only" ? "Admin" : "Users"}
                </span>
            )}

            <div>
                <div className="app-icon-container">
                    <SafeIcon name={app.icon} size={26} />
                </div>
                <h3 className="app-title">{app.title}</h3>
                <p className="app-description">{app.description}</p>
            </div>

            <a
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className="app-launch-btn"
            >
                Launch <SafeIcon name="ExternalLink" size={14} />
            </a>
        </div>
    );
}
