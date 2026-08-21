"use client";

import React, { useState } from "react";
import { UserProfile, UserRole } from "@/types";
import { SafeIcon } from "../ui/SafeIcon";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRole: UserRole;
    onSelectUser: (user: UserProfile) => void;
}

/**
 * Auth Modal supporting Email/Password Sign In & Sign Up forms and Google OAuth UI buttons.
 */
export default function AuthModal({ isOpen, onClose, onSelectUser }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [feedback, setFeedback] = useState<{ type: "info" | "error" | "success"; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleGoogleAuth = () => {
        setFeedback({
            type: "info",
            text: "Google Sign-In UI component triggered (OAuth integration in next phase)."
        });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFeedback({
                    type: "error",
                    text: data.error || "Invalid email or password."
                });
                return;
            }

            onSelectUser(data.user);
            setFeedback({ type: "success", text: `Welcome back ${data.user.name}!` });
            setTimeout(() => {
                setFeedback(null);
                onClose();
            }, 1000);
        } catch (err) {
            setFeedback({ type: "error", text: "Network error. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (!email || !name || !password) return;

        if (password !== confirmPassword) {
            setFeedback({ type: "error", text: "Passwords do not match." });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFeedback({
                    type: "error",
                    text: data.error || "Registration failed."
                });
                return;
            }

            onSelectUser(data.user);
            setFeedback({ type: "success", text: `Account created! Welcome ${data.user.name}!` });
            setTimeout(() => {
                setFeedback(null);
                onClose();
            }, 1000);
        } catch (err) {
            setFeedback({ type: "error", text: "Network error. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#111420] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Account Access</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <SafeIcon name="X" size={20} />
                    </button>
                </div>

                {/* Feedback Toast Banner */}
                {feedback && (
                    <div className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        feedback.type === "error"
                            ? "bg-rose-500/20 border-rose-500 text-rose-200"
                            : feedback.type === "success"
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                            : "bg-sky-500/20 border-sky-400 text-sky-200"
                    }`}>
                        <SafeIcon name="Info" size={16} />
                        <span>{feedback.text}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-5">
                    <button
                        onClick={() => { setActiveTab("signin"); setFeedback(null); }}
                        className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                            activeTab === "signin"
                                ? "border-sky-400 text-sky-400"
                                : "border-transparent text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setActiveTab("signup"); setFeedback(null); }}
                        className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                            activeTab === "signup"
                                ? "border-sky-400 text-sky-400"
                                : "border-transparent text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Google Auth UI Button */}
                <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full py-2.5 px-4 mb-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center gap-3 text-xs font-medium transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    {activeTab === "signin" ? "Sign In with Google" : "Sign Up with Google"}
                </button>

                <div className="relative flex py-2 items-center mb-4">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-[11px] text-gray-500 uppercase tracking-wider">Or email</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Form Content */}
                {activeTab === "signin" ? (
                    <form onSubmit={handleSignIn} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="dilipdangoriya@gmail.com or user@devhub.com"
                                className={`w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-white text-xs outline-none transition-all ${
                                    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                                        ? "border-white/12 focus:border-sky-400"
                                        : "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)] text-rose-200"
                                }`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                                <p className="text-[11px] text-rose-400 mt-1 font-medium">Please enter a valid email address.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="admin123 or user123"
                                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-xs outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold text-xs transition-all shadow-lg mt-2 disabled:opacity-50"
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignUp} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Full Name"
                                className="w-full px-3 py-2 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-xs outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                className={`w-full px-3 py-2 bg-white/5 border rounded-xl text-white text-xs outline-none transition-all ${
                                    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                                        ? "border-white/12 focus:border-sky-400"
                                        : "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)] text-rose-200"
                                }`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                                <p className="text-[11px] text-rose-400 mt-1 font-medium">Please enter a valid email address.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="Create a password"
                                className="w-full px-3 py-2 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-xs outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="Confirm password"
                                className={`w-full px-3 py-2 bg-white/5 border rounded-xl text-white text-xs outline-none transition-all ${
                                    !confirmPassword || confirmPassword === password
                                        ? "border-white/12 focus:border-sky-400"
                                        : "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)] text-rose-200"
                                }`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {confirmPassword && confirmPassword !== password && (
                                <p className="text-[11px] text-rose-400 mt-1 font-medium">Passwords do not match.</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold text-xs transition-all shadow-lg mt-2 disabled:opacity-50"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
