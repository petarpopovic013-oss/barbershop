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
      <div className="w-full max-w-sm rounded-[20px] border-2 border-white/10 bg-[#1a1a1a] p-7 shadow-2xl sm:max-w-md sm:rounded-[24px] sm:p-10">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="font-heading text-[30px] text-white sm:text-[36px] md:text-[42px] lg:text-[48px]">
            ADMIN PRIJAVA
          </h1>
          <span className="mt-3 mx-auto block h-[3px] w-12 bg-white/70 sm:mt-4 sm:w-16" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <label className="block">
            <span className="mb-2 block font-heading text-[10px] uppercase tracking-widest text-white/80 sm:mb-3 sm:text-[11px]">
              Lozinka
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[48px] rounded-full border-2 border-white/20 bg-[#141417] px-5 py-3 text-white placeholder:text-white/40 transition-all duration-300 focus:border-[#525252] focus:outline-none focus:ring-2 focus:ring-[#525252]/50 sm:min-h-[52px] sm:px-6"
              placeholder="Unesite lozinku"
              autoFocus
            />
          </label>
          {error && (
            <div className="rounded-full border-2 border-red-500/50 bg-red-500/10 px-4 py-2.5 sm:py-3">
              <p className="text-[12px] text-red-400 text-center sm:text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full min-h-[48px] rounded-full bg-white/90 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] transition-all duration-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[52px] sm:text-[11px] sm:tracking-[0.2em]"
          >
            {loading ? "PRIJAVLJIVANJE..." : "PRIJAVI SE"}
          </button>
        </form>
        <p className="mt-6 text-center sm:mt-8">
          <Link
            href="/"
            className="text-[11px] font-medium tracking-wider text-white/60 hover:text-white transition-colors duration-300 sm:text-[12px]"
          >
            &larr; Nazad na sajt
          </Link>
        </p>
      </div>
    </div>
  );
}
