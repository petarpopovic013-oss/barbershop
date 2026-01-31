"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "Barbers" },
  { href: "#prices", label: "Prices" },
  { href: "#visit", label: "Visit" },
  { href: "#gallery", label: "Gallery" },
  { href: "/admin", label: "Admin" },
];

const SECTION_IDS = navLinks.map((l) => l.href.slice(1)); // ["home", "about", ...]
const ID_TO_LABEL = Object.fromEntries(navLinks.map((l) => [l.href.slice(1), l.label]));

function getActiveLabel(): string {
  const offset = 120; // pixels from top (sticky header + buffer)
  let currentId: string | null = null;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= offset) currentId = id;
  }
  return (currentId && ID_TO_LABEL[currentId]) || "Home";
}

export function Header({ onBookClick }: { onBookClick: () => void }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const isAdmin = pathname === "/admin";

  useEffect(() => {
    if (isAdmin) {
      setActiveLink("Admin");
      return;
    }
    const handleScroll = () => setActiveLink(getActiveLabel());
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // set initial
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdmin]);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[var(--surface-dark)] px-4 py-4 sm:px-6 lg:px-8"
      role="banner"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href={isAdmin ? "/" : "#home"}
          className="font-serif text-xl font-semibold tracking-tight text-white focus-ring rounded transition-default hover:opacity-90"
          onClick={() => setActiveLink("Home")}
        >
          Sharp Cut
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={label === "Home" && isAdmin ? "/" : href}
              className={
                activeLink === label || (label === "Admin" && isAdmin)
                  ? "rounded px-3 py-2 text-sm font-medium tracking-wide text-white ring-2 ring-white/80 ring-offset-2 ring-offset-[var(--surface-dark)] transition-default focus-ring"
                  : "rounded px-3 py-2 text-sm font-medium tracking-wide text-white/90 transition-default focus-ring hover:bg-white/10 hover:text-white"
              }
              onClick={() => setActiveLink(label)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBookClick}
            className="hidden rounded-[var(--radius-btn)] border border-white/30 bg-transparent px-4 py-2.5 text-sm font-semibold tracking-wide text-white transition-default focus-ring hover:border-[var(--accent)] hover:bg-white/10 active:scale-[0.98] md:block"
          >
            Book
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-btn)] text-white focus-ring md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-5 bg-current transition-transform ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-5 bg-current transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-5 bg-current transition-transform ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-200 ${mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav
          className="flex flex-col gap-1 border-t border-white/20 py-4"
          aria-label="Mobile navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={label === "Home" && isAdmin ? "/" : href}
              className="rounded px-4 py-3 text-white hover:bg-white/10 focus-ring"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveLink(label);
              }}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onBookClick();
            }}
            className="mx-4 mt-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold tracking-wide text-white transition-default focus-ring hover:bg-[var(--accent-hover)]"
          >
            Book
          </button>
        </nav>
      </div>
    </header>
  );
}
