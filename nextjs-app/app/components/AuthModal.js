"use client";

import React from "react";
import { SafeIcon } from "./IconHelper";
import { MOCK_USERS } from "../mockData";

export default function AuthModal({ isOpen, onClose, currentRole, onSelectUser }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div className="modal-header">
                    <h2 className="modal-title">Sign In / Switch Role</h2>
                    <button className="modal-close" onClick={onClose}>
                        <SafeIcon name="X" size={20} />
                    </button>
                </div>

                <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "20px", lineHeight: "1.5" }}>
                    Select a testing role below to preview how the dashboard adapts app access permissions and admin controls:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Guest */}
                    <div
                        onClick={() => {
                            onSelectUser(MOCK_USERS.guest);
                            onClose();
                        }}
                        style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: currentRole === "guest" ? "rgba(56, 189, 248, 0.12)" : "rgba(255, 255, 255, 0.04)",
                            border: currentRole === "guest" ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <div style={{ padding: 10, background: "rgba(255, 255, 255, 0.08)", borderRadius: "50%", color: "#9ca3af" }}>
                            <SafeIcon name="User" size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>Guest (Logged Out)</div>
                            <div style={{ fontSize: "12px", color: "#9ca3af" }}>Sees public apps (`all`) only. No add app access.</div>
                        </div>
                    </div>

                    {/* Normal User */}
                    <div
                        onClick={() => {
                            onSelectUser(MOCK_USERS.user);
                            onClose();
                        }}
                        style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: currentRole === "normal-user" ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.04)",
                            border: currentRole === "normal-user" ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.1)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <img
                            src={MOCK_USERS.user.avatar}
                            alt="Dev Profile"
                            style={{ width: 40, height: 40, borderRadius: "50%" }}
                        />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>Normal User (Dev Profile)</div>
                            <div style={{ fontSize: "12px", color: "#9ca3af" }}>Sees `all` & `normal-user` apps.</div>
                        </div>
                    </div>

                    {/* Admin User */}
                    <div
                        onClick={() => {
                            onSelectUser(MOCK_USERS.admin);
                            onClose();
                        }}
                        style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: currentRole === "admin-only" ? "rgba(168, 85, 247, 0.12)" : "rgba(255, 255, 255, 0.04)",
                            border: currentRole === "admin-only" ? "1px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.1)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <img
                            src={MOCK_USERS.admin.avatar}
                            alt="Admin"
                            style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #a855f7" }}
                        />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>Admin User</div>
                            <div style={{ fontSize: "12px", color: "#9ca3af" }}>Full access to all apps + Add New Application tile.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
