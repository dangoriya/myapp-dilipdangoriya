"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SafeIcon } from "@/app/components/ui/SafeIcon";

interface FieldError {
  message: string;
}

export default function LocalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<FieldError | null>(null);
  const [passwordError, setPasswordError] = useState<FieldError | null>(null);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (!value) return "Password is required";
    if (value.length < 4) return "Password must be at least 4 characters";
    return null;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const err = validateEmail(value);
    setEmailError(err ? { message: err } : null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const err = validatePassword(value);
    setPasswordError(err ? { message: err } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr) setEmailError({ message: emailErr });
    if (passwordErr) setPasswordError({ message: passwordErr });
    if (emailErr || passwordErr) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Invalid email or password");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase = "w-full px-3.5 py-2.5 bg-white/5 rounded-xl text-white text-xs outline-none transition-all";
  const inputValid = "border-white/12 focus:border-sky-400";
  const inputInvalid = "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)] text-rose-200";

  return (
    <div className="min-h-screen bg-[#0d1017] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#131722] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Sign In</h2>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
            <SafeIcon name="AlertCircle" size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="admin@example.com"
              className={`${inputBase} ${emailError ? inputInvalid : inputValid}`}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              aria-invalid={emailError ? "true" : "false"}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && (
              <p id="email-error" className="text-[11px] text-rose-400 mt-1 font-medium" role="alert">
                {emailError.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="admin123"
              className={`${inputBase} ${passwordError ? inputInvalid : inputValid}`}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              aria-invalid={passwordError ? "true" : "false"}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            {passwordError && (
              <p id="password-error" className="text-[11px] text-rose-400 mt-1 font-medium" role="alert">
                {passwordError.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold text-xs transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Demo: admin@example.com / admin123 &nbsp;|&nbsp; user@example.com / user123
        </p>
      </div>
    </div>
  );
}