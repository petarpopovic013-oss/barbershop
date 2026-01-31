"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Invalid password");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--border-muted)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <h1 className="mb-6 text-center font-serif text-xl font-semibold text-[var(--foreground)]">
          Admin login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--foreground-muted)]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              placeholder="Enter password"
              autoFocus
            />
          </label>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-[var(--radius-btn)] bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
