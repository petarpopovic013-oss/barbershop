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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-4">
      <div className="w-full max-w-sm rounded-[20px] border border-[#2A2A2F] bg-[#141417] p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-2xl font-bold text-[#F5F5F7]">
          Admin prijava
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#A1A1A6]">
              Lozinka
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[48px] rounded-lg border border-[#2A2A2F] bg-[#0A0A0B] px-4 py-3 text-[#F5F5F7] placeholder:text-[#6B6B70] transition-default focus:border-[#D3AF37] focus:outline-none focus:ring-2 focus:ring-[#D3AF37]/25"
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
            className="w-full min-h-[48px] rounded-lg bg-[#D3AF37] py-3 text-base font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#E0C04A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-[#009FFD] hover:text-[#33B3FF] transition-colors"
          >
            ← Nazad na sajt
          </Link>
        </p>
      </div>
    </div>
  );
}
