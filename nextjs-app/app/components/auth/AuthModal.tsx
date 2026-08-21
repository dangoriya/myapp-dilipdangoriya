"use client";

import React from "react";
import { UserProfile, UserRole } from "@/types";
import { MOCK_USERS } from "@/lib/constants";
import { SafeIcon } from "../ui/SafeIcon";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRole: UserRole;
    onSelectUser: (user: UserProfile) => void;
}

/**
 * Auth Modal Component for role switching & testing
 */
export default function AuthModal({ isOpen, onClose, currentRole, onSelectUser }: AuthModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#111420] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Sign In / Switch Role</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <SafeIcon name="X" size={20} />
                    </button>
                </div>

                <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                    Select a testing role below to preview how the dashboard adapts app access permissions and admin controls:
                </p>

                <div className="flex flex-col gap-3">
                    {/* Guest Option */}
                    <div
                        onClick={() => {
                            onSelectUser(MOCK_USERS.guest);
                            onClose();
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3.5 transition-all ${
                            currentRole === "guest"
                                ? "bg-sky-500/15 border-sky-400"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                    >
                        <div className="p-2.5 bg-white/10 rounded-full text-gray-400">
                            <SafeIcon name="User" size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-white">Guest (Logged Out)</div>
                            <div className="text-xs text-gray-400">Sees public apps (`all`) only.</div>
                        </div>
                    </div>

                    {/* Normal User Option */}
                    <div
                        onClick={() => {
                            onSelectUser(MOCK_USERS.user);
                            onClose();
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3.5 transition-all ${
                            currentRole === "normal-user"
                                ? "bg-emerald-500/15 border-emerald-400"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                    >
                        <img
                            src={MOCK_USERS.user.avatar}
                            alt="Dev Profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="font-semibold text-sm text-white">Normal User (Dev Profile)</div>
                            <div className="text-xs text-gray-400">Sees `all` & `normal-user` apps.</div>
                        </div>
                    </div>

                    {/* Admin User Option */}
                    <div
                        onClick={() => {
                            onSelectUser(MOCK_USERS.admin);
                            onClose();
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3.5 transition-all ${
                            currentRole === "admin-only"
                                ? "bg-purple-500/15 border-purple-400"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                    >
                        <img
                            src={MOCK_USERS.admin.avatar}
                            alt="Admin"
                            className="w-10 h-10 rounded-full object-cover border border-purple-400"
                        />
                        <div>
                            <div className="font-semibold text-sm text-white">Admin User</div>
                            <div className="text-xs text-gray-400">Full access to all apps + Add New App.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
