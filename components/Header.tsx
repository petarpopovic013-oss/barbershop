"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#tim", label: "NAŠ TIM" },
  { href: "#usluge", label: "USLUGE" },
  { href: "#cenovnik", label: "CENOVNIK" },
  { href: "#galerija", label: "GALERIJA" },
  { href: "#kontakt", label: "KONTAKT" },
];

export function Header({ onBookClick }: { onBookClick: () => void }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdmin]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/90 backdrop-blur-sm shadow-lg shadow-black/20"
          : "bg-transparent"
      } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      role="banner"
    >
      {/* Desktop Navigation */}
      <nav
        className="hidden md:flex items-center justify-center gap-12 py-6"
        aria-label="Main navigation"
      >
        {navLinks.map(({ href, label }, i) => (
          <Link
            key={href}
            href={isAdmin ? `/${href}` : href}
            className={`group relative pb-1 text-[11px] font-medium tracking-[0.15em] text-white/90 transition-all duration-300 hover:text-white focus-ring ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{
              transitionDelay: `${300 + i * 80}ms`,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {label}
            <span
              className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100"
              aria-hidden
            />
          </Link>
        ))}
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="text-[11px] font-medium tracking-[0.15em] text-white"
        >
          MENU
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-8 w-8 flex-col items-center justify-center gap-1 text-white focus-ring"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <span className={`h-[1px] w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`h-[1px] w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`h-[1px] w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-400 bg-black/95 ${
          mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="flex flex-col items-center gap-6 py-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={isAdmin ? `/${href}` : href}
              className="group relative inline-block pb-1 text-[12px] font-medium tracking-[0.15em] text-white/80 transition-colors hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
              <span
                className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100"
                aria-hidden
              />
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onBookClick();
            }}
            className="mt-4 btn-outline-white"
          >
            ZAKAŽI TERMIN
          </button>
        </nav>
      </div>
    </header>
  );
}
