"use client";

import React, { CSSProperties } from "react";
import { AppItem, UserRole } from "@/types";
import { hexToRgba } from "@/lib/colors";
import { SafeIcon } from "../ui/SafeIcon";

interface AppCardProps {
    app: AppItem;
    userRole: UserRole;
    onEdit?: (app: AppItem) => void;
    onDelete?: (appId: string) => void;
}

/**
 * Application Card Component
 * Computes dynamic glassmorphism gradient glowing background based on app main color.
 * Includes Edit and Delete action controls for Admin users.
 */
export default function AppCard({ app, userRole, onEdit, onDelete }: AppCardProps) {
    const mainColor = app.color || "#10b981";

    // Dynamic CSS custom variables for card gradient & border glow
    const cardStyle = {
        "--card-border": hexToRgba(mainColor, 0.3),
        "--card-gradient": `radial-gradient(circle at 20% 20%, ${hexToRgba(mainColor, 0.28)} 0%, rgba(17, 20, 32, 0.95) 70%)`,
        "--card-glow": hexToRgba(mainColor, 0.35),
    } as CSSProperties;

    const isAdmin = userRole === "admin-only";

    return (
        <div
            className="app-card-container group relative rounded-2xl p-4 sm:p-6 flex flex-col justify-between min-h-[160px] sm:min-h-[210px] overflow-hidden"
            style={cardStyle}
        >
            {/* Top Bar: Admin Action Controls & Access Permission Badge below */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col items-end gap-1.5 z-10">
                {isAdmin && (onEdit || onDelete) && (
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/15 opacity-90 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(app);
                                }}
                                className="p-0.5 text-amber-400 hover:text-amber-300 transition-colors flex items-center"
                                title="Edit Application"
                            >
                                <SafeIcon name="Pencil" size={13} />
                            </button>
                        )}
                        {onEdit && onDelete && (
                            <span className="w-px h-3 bg-white/25" />
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Are you sure you want to delete "${app.title}"?`)) {
                                        onDelete(app.id);
                                    }
                                }}
                                className="p-0.5 text-rose-400 hover:text-rose-300 transition-colors flex items-center"
                                title="Delete Application"
                            >
                                <SafeIcon name="Trash2" size={13} />
                            </button>
                        )}
                    </div>
                )}

                {isAdmin && app.access !== "all" && (
                    <span className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-md bg-white/10 text-gray-300 border border-white/10 backdrop-blur-sm shadow-xs">
                        {app.access === "admin-only" ? "Admin" : "Users"}
                    </span>
                )}
            </div>

            <div>
                {/* Icon Container */}
                <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 border border-white/15"
                    style={{
                        backgroundColor: hexToRgba(mainColor, 0.18),
                        color: mainColor,
                    }}
                >
                    <SafeIcon name={app.icon} size={22} className="sm:hidden" />
                    <SafeIcon name={app.icon} size={26} className="hidden sm:block" />
                </div>

                {/* Title & Description */}
                <h3 className="text-sm sm:text-lg font-bold text-white mb-1 sm:mb-2 leading-tight">
                    {app.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/70 leading-normal sm:leading-relaxed mb-4 line-clamp-2">
                    {app.description}
                </p>
            </div>

            {/* Bottom External Launch Button */}
            <a
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold hover:underline w-fit transition-opacity hover:opacity-85 mt-auto"
                style={{ color: mainColor }}
            >
                Launch <SafeIcon name="ExternalLink" size={13} />
            </a>
        </div>
    );
}
