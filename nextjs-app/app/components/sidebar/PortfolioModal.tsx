"use client";

import React, { useState, useEffect } from "react";
import { SafeIcon } from "../ui/SafeIcon";

interface PortfolioModalProps {
    isOpen: boolean;
    currentUrl: string;
    onClose: () => void;
    onSave: (url: string) => void;
}

/**
 * Modal form for updating or adding personal Portfolio URL
 */
export default function PortfolioModal({ isOpen, currentUrl, onClose, onSave }: PortfolioModalProps) {
    const [url, setUrl] = useState(currentUrl || "");

    useEffect(() => {
        setUrl(currentUrl || "");
    }, [currentUrl]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(url.trim());
        onClose();
    };

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
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <SafeIcon name="Globe" size={18} className="text-sky-400" />
                        My Portfolio Link
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <SafeIcon name="X" size={18} />
                    </button>
                </div>

                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Add or update your personal portfolio URL. This link will be displayed on your sidebar profile card.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Portfolio URL (Optional)
                        </label>
                        <input
                            type="url"
                            placeholder="https://yourportfolio.com"
                            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 focus:border-sky-400 rounded-xl text-white text-xs outline-none transition-all placeholder-gray-500"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold text-xs transition-all shadow-lg"
                        >
                            Save Portfolio Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
