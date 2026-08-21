"use client";

import React from "react";
import { SafeIcon } from "../ui/SafeIcon";
import GradientText from "../ui/GradientText";

interface GalleryHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onToggleMobileNav: () => void;
}

/**
 * Gallery Header Component
 * Contains mobile drawer toggle, animated gradient workspace title, description, and live search bar.
 */
export default function GalleryHeader({
    searchQuery,
    setSearchQuery,
    onToggleMobileNav
}: GalleryHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Header Title & Mobile Toggle Container */}
            <div className="flex items-stretch gap-3.5">
                {/* Mobile Menu Toggle Button Box */}
                <button
                    onClick={onToggleMobileNav}
                    className="lg:hidden shrink-0 self-stretch px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="Toggle Navigation Menu"
                >
                    <SafeIcon name="Menu" size={22} />
                </button>

                <div className="flex flex-col justify-center items-start">
                    <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase leading-normal -ml-0.5">
                        <GradientText
                            colors={["#40ffaa", "#4079ff", "#a855f7", "#40ffaa", "#4079ff"]}
                            animationSpeed={4}
                            showBorder={false}
                        >
                            App Workspace
                        </GradientText>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5 leading-snug">
                        Centralized application gallery for quick access.
                    </p>
                </div>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <SafeIcon name="Search" size={17} />
                </div>
                <input
                    type="text"
                    placeholder="Search apps..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-white/30 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all focus:bg-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    );
}
