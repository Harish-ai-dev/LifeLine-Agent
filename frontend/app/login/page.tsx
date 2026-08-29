"use client";

import React, { FormEvent, useState } from "react";
import { ShieldCheck, UserRound, Lock, LogIn, Eye, EyeOff, ArrowRight } from "lucide-react";

const DEMO_USER = {
  username: "lifeline",
  password: "demo123",
};

const STORAGE_KEY = "lifeline-demo-session";

export default function LoginPage() {
  const [username, setUsername] = useState(DEMO_USER.username);
  const [password, setPassword] = useState(DEMO_USER.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    if (username.trim() === DEMO_USER.username && password === DEMO_USER.password) {
      window.localStorage.setItem(STORAGE_KEY, "active");
      window.location.href = "/";
      return;
    }

    setError("Use the sample username and password shown on this page.");
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#142433]">
      <div className="absolute inset-x-0 top-0 h-2 bg-[#c84a3d]" />
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#d8d0c0] bg-white/70 px-4 py-2 text-sm font-semibold text-[#245b73] shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#c84a3d]" />
            Demo access only
          </div>

          <div className="max-w-2xl space-y-5">
            <p className="font-mono text-sm uppercase tracking-[0.28em] text-[#64717c]">
              LifeLine Agent
            </p>
            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#142433] sm:text-6xl lg:text-7xl">
              Emergency handoff board for clear dispatch decisions.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#485866]">
              A frontend-only demo view for reviewing cases, destination recommendations,
              route timing, and hospital handoff notes without connecting to a backend.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["3", "demo cases"],
              ["5", "handoff stages"],
              ["0", "backend calls"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#ddd4c4] bg-white/65 p-4 shadow-sm">
                <div className="font-mono text-3xl font-bold text-[#245b73]">{value}</div>
                <div className="text-sm font-semibold text-[#64717c]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#d8d0c0] bg-white p-6 shadow-[0_24px_80px_rgba(20,36,51,0.12)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em]">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-[#64717c]">
                Use the sample login now. Real authentication can be added later.
              </p>
            </div>
            <div className="rounded-2xl bg-[#cfe5da] p-3 text-[#245b73]">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-[#263847]">Username</span>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9caaa9]" aria-hidden="true" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d8d0c0] bg-[#fbf8f0] pl-12 pr-4 text-base font-semibold outline-none transition focus:border-[#245b73] focus:ring-4 focus:ring-[#245b73]/15"
                  autoComplete="username"
                  disabled={isSubmitting}
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-[#263847]">Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9caaa9]" aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d8d0c0] bg-[#fbf8f0] pl-12 pr-12 text-base font-semibold outline-none transition focus:border-[#245b73] focus:ring-4 focus:ring-[#245b73]/15"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9caaa9] hover:text-[#485866] transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-2xl border border-[#e7b5a9] bg-[#fff3ef] px-4 py-3 text-sm font-semibold text-[#9c332b]" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#142433] px-5 text-base font-black text-white shadow-lg shadow-[#142433]/20 transition hover:bg-[#20384d] focus:outline-none focus:ring-4 focus:ring-[#245b73]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in
                </>
              ) : (
                <>
                  Open demo board
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-[#d8d0c0] bg-[#fbf8f0] p-4 text-sm text-[#485866]">
            <p className="font-bold text-[#142433]">Sample credentials</p>
            <p className="mt-2 font-mono">Username: {DEMO_USER.username}</p>
            <p className="font-mono">Password: {DEMO_USER.password}</p>
          </div>
        </div>
      </section>
    </main>
  );
}