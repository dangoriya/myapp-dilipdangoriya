"use client";

import React from "react";
import { UserProfile } from "@/types";
import { SafeIcon } from "../ui/SafeIcon";

interface SidebarProps {
    currentUser: UserProfile;
    onOpenAuthModal: () => void;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}

/**
 * Sidebar Drawer Component
 * Includes brand header, centered profile card, quick navigation links, and user role switcher.
 */
export default function Sidebar({
    currentUser,
    onOpenAuthModal,
    isMobileOpen,
    onCloseMobile
}: SidebarProps) {
    const roleLabelMap: Record<UserProfile['role'], string> = {
        guest: "Guest View",
        "normal-user": "Normal User",
        "admin-only": "Admin",
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar Drawer Container */}
            <aside
                className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-gradient-to-b from-[#131722] to-[#0d1017] border-r border-white/10 p-6 flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onCloseMobile}
                        className="lg:hidden p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
                        aria-label="Close Sidebar"
                    >
                        <SafeIcon name="X" size={20} />
                    </button>
                </div>

                {/* Profile Section (Centered Layout, No Box Container) */}
                <div className="flex flex-col items-center text-center mb-6">
                    {/* Row 1: Centered Avatar */}
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/20 mb-2.5 shadow-md"
                    />

                    {/* Row 2: User Name & Email */}
                    <div className="w-full px-2 mb-3">
                        <div className="text-sm font-semibold text-white truncate">
                            {currentUser.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                            {currentUser.email}
                        </div>
                    </div>

                    {/* My Portfolio Button */}
                    <a
                        href={currentUser.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white text-xs font-medium transition-all"
                    >
                        <SafeIcon name="ExternalLink" size={13} />
                        My Portfolio
                    </a>
                </div>

                {/* Main Navigation */}
                <nav className="mb-6">
                    <a
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-emerald-500/20 to-white/5 border-l-4 border-emerald-500 font-semibold text-sm transition-all"
                    >
                        <SafeIcon name="LayoutDashboard" size={18} />
                        App Workspace
                    </a>
                </nav>

                {/* Quick Links Header */}
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 px-2">
                    Quick Links
                </div>

                <div className="flex flex-col gap-1">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-sky-400 text-xs font-medium rounded-lg transition-colors"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                            <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                        GitHub
                    </a>
                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-sky-400 text-xs font-medium rounded-lg transition-colors"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                    </a>
                    <a
                        href="mailto:contact@iprofile.com"
                        className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-sky-400 text-xs font-medium rounded-lg transition-colors"
                    >
                        <SafeIcon name="Mail" size={15} />
                        Contact
                    </a>
                </div>

                {/* User Role Switcher */}
                <div className="mt-auto pt-6">
                    <button
                        onClick={onOpenAuthModal}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 flex items-center justify-between text-xs font-medium transition-all"
                    >
                        <span className="flex items-center gap-2">
                            <SafeIcon name="UserCheck" size={15} style={{ color: "#10b981" }} />
                            {roleLabelMap[currentUser.role]}
                        </span>
                        <SafeIcon name="ChevronRight" size={13} />
                    </button>
                </div>
            </aside>
        </>
    );
}
