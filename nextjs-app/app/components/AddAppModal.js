"use client";

import React, { useState } from "react";
import { SafeIcon } from "./IconHelper";
import { COLOR_PRESETS, ICON_OPTIONS } from "../mockData";

export default function AddAppModal({ isOpen, onClose, onAddApp }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [icon, setIcon] = useState("Bot");
    const [color, setColor] = useState("#10b981");
    const [access, setAccess] = useState("all");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !link) return;

        const newApp = {
            id: `app-${Date.now()}`,
            title,
            description: description || "Centralized launchpad application.",
            link,
            icon,
            color,
            access,
        };

        onAddApp(newApp);
        // Reset
        setTitle("");
        setDescription("");
        setLink("");
        setIcon("Bot");
        setColor("#10b981");
        setAccess("all");
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add New Application</h2>
                    <button className="modal-close" onClick={onClose}>
                        <SafeIcon name="X" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Application Title *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. AI Studio"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Short Description */}
                    <div className="form-group">
                        <label className="form-label">Short Description</label>
                        <textarea
                            rows={2}
                            placeholder="Briefly describe what this app does..."
                            className="form-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Application Link */}
                    <div className="form-group">
                        <label className="form-label">Application Link (URL) *</label>
                        <input
                            type="url"
                            required
                            placeholder="https://example.com"
                            className="form-input"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>

                    {/* Select Icon */}
                    <div className="form-group">
                        <label className="form-label">Choose Icon</label>
                        <div className="icon-grid">
                            {ICON_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    className={`icon-btn ${icon === opt.id ? "active" : ""}`}
                                    onClick={() => setIcon(opt.id)}
                                    title={opt.label}
                                >
                                    <SafeIcon name={opt.id} size={20} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Select Main Color */}
                    <div className="form-group">
                        <label className="form-label">Main Accent Color (Auto Gradient)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    background: "transparent",
                                }}
                            />
                            <div className="color-presets">
                                {COLOR_PRESETS.map((p) => (
                                    <div
                                        key={p.hex}
                                        className={`color-swatch ${color.toLowerCase() === p.hex.toLowerCase() ? "active" : ""}`}
                                        style={{ backgroundColor: p.hex }}
                                        onClick={() => setColor(p.hex)}
                                        title={p.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Access Permission */}
                    <div className="form-group">
                        <label className="form-label">Access Control</label>
                        <select
                            className="form-select"
                            value={access}
                            onChange={(e) => setAccess(e.target.value)}
                        >
                            <option value="all" style={{ background: "#111420", color: "#fff" }}>
                                All (Everyone / Guests)
                            </option>
                            <option value="normal-user" style={{ background: "#111420", color: "#fff" }}>
                                Normal User & Admin
                            </option>
                            <option value="admin-only" style={{ background: "#111420", color: "#fff" }}>
                                Admin Only
                            </option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-primary" style={{ marginTop: "12px" }}>
                        Create Application
                    </button>
                </form>
            </div>
        </div>
    );
}
