"use client";

import React, { useState } from "react";
import { AccessLevel, AppItem } from "@/types";
import { COLOR_PRESETS, ICON_OPTIONS } from "@/lib/presets";
import { SafeIcon, normalizeIconName } from "../ui/SafeIcon";

interface AddAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddApp: (newApp: AppItem) => void;
}

/**
 * Add Application Modal Form (Admin Access Only)
 */
export default function AddAppModal({ isOpen, onClose, onAddApp }: AddAppModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [icon, setIcon] = useState("");
    const [color, setColor] = useState("#10b981");
    const [access, setAccess] = useState<AccessLevel>("all");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !link) return;

        const normalized = normalizeIconName(icon) || "AppWindow";

        const newApp: AppItem = {
            id: `app-${Date.now()}`,
            title,
            description: description || "Centralized launchpad application.",
            link,
            icon: normalized,
            color,
            access,
        };

        onAddApp(newApp);
        // Reset form
        setTitle("");
        setDescription("");
        setLink("");
        setIcon("");
        setColor("#10b981");
        setAccess("all");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#111420] border border-white/15 rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white">Add New Application</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <SafeIcon name="X" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Application Title *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. AI Studio"
                            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-sm outline-none transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Short Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Short Description
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Briefly describe what this app does..."
                            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-sm outline-none transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Link URL */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Application Link (URL) *
                        </label>
                        <input
                            type="url"
                            required
                            placeholder="https://example.com"
                            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-sm outline-none transition-all"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>

                    {/* Choose Icon Section */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-gray-300">
                                Choose Icon
                            </label>
                            <a
                                href="https://lucide.dev/icons/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                            >
                                Browse All Icons <SafeIcon name="ExternalLink" size={11} />
                            </a>
                        </div>

                        {/* Preset Icon Grid */}
                        <div className="grid grid-cols-6 gap-2 mb-2.5">
                            {ICON_OPTIONS.map((opt) => {
                                const isSelected = icon.trim().toLowerCase() === opt.id.toLowerCase();
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                                            isSelected
                                                ? "bg-sky-500/20 border-2 border-sky-400 text-sky-400 scale-105 shadow-md"
                                                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                        onClick={() => setIcon(opt.id)}
                                        title={opt.label}
                                    >
                                        <SafeIcon name={opt.id} size={20} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Icon Name Field with minimal live icon preview */}
                        <div className="relative flex items-center">
                            {icon.trim() && (
                                <div className="absolute left-3 text-sky-400 pointer-events-none flex items-center">
                                    <SafeIcon name={icon} size={15} />
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Or paste icon name from lucide.dev (e.g. save, git-branch, trash-2)"
                                className={`w-full py-2 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-xs outline-none transition-all placeholder-gray-500 ${
                                    icon.trim() ? "pl-9 pr-3.5" : "px-3.5"
                                }`}
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Main Accent Color Swatches */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                            Main Accent Color
                        </label>
                        <div className="flex flex-wrap items-center gap-3 py-1.5 px-1">
                            {COLOR_PRESETS.map((p) => {
                                const isSelected = color.toLowerCase() === p.hex.toLowerCase();
                                return (
                                    <div
                                        key={p.hex}
                                        className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-200 ${
                                            isSelected
                                                ? "scale-125 border-2 border-white ring-2 ring-white/50 shadow-lg"
                                                : "border border-transparent hover:scale-110 opacity-75 hover:opacity-100"
                                        }`}
                                        style={{ backgroundColor: p.hex }}
                                        onClick={() => setColor(p.hex)}
                                        title={p.name}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Access Control Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Access Control
                        </label>
                        <select
                            className="w-full px-3.5 py-2.5 bg-[#111420] border border-white/12 focus:border-sky-400 rounded-xl text-white text-sm outline-none"
                            value={access}
                            onChange={(e) => setAccess(e.target.value as AccessLevel)}
                        >
                            <option value="all">All (Everyone / Guests)</option>
                            <option value="normal-user">Normal User & Admin</option>
                            <option value="admin-only">Admin Only</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm transition-all shadow-lg"
                    >
                        Create Application
                    </button>
                </form>
            </div>
        </div>
    );
}
