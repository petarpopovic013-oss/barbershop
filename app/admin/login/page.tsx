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
        setError(data.message || "Pogrešna lozinka");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Nešto je pošlo po zlu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] px-4">
      <div className="w-full max-w-sm border border-white/10 bg-[#222] p-8 shadow-2xl">
        <h1 className="mb-8 text-center font-heading text-4xl text-white md:text-5xl">
          ADMIN PRIJAVA
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/70">
              Lozinka
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[48px] border border-white/20 bg-[#1a1a1a] px-4 py-3 text-white placeholder:text-white/40 transition-all focus:border-white focus:outline-none"
              placeholder="Unesite lozinku"
              autoFocus
            />
          </label>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full min-h-[48px] bg-white py-3 text-sm font-medium tracking-wider text-[#1a1a1a] transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "PRIJAVLJIVANJE..." : "PRIJAVI SE"}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            &larr; Nazad na sajt
          </Link>
        </p>
      </div>
    </div>
  );
}
