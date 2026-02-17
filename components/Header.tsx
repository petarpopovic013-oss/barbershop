"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#home", label: "Početak" },
  { href: "#about", label: "Berberi" },
  { href: "#prices", label: "Cene" },
  { href: "#visit", label: "Posetite nas" },
  { href: "#gallery", label: "Galerija" },
  { href: "/admin", label: "Admin" },
];

const SECTION_IDS = navLinks.map((l) => l.href.slice(1));
const ID_TO_LABEL = Object.fromEntries(navLinks.map((l) => [l.href.slice(1), l.label]));

function getActiveLabel(): string {
  const offset = 120;
  let currentId: string | null = null;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= offset) currentId = id;
  }
  return (currentId && ID_TO_LABEL[currentId]) || "Početak";
}

export function Header({ onBookClick }: { onBookClick: () => void }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Početak");
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = pathname === "/admin";

  useEffect(() => {
    if (isAdmin) {
      setActiveLink("Admin");
      return;
    }
    const handleScroll = () => {
      setActiveLink(getActiveLabel());
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdmin]);

  return (
    <header
      className={`sticky top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        scrolled 
          ? "bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#2A2A2F]" 
          : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href={isAdmin ? "/" : "#home"}
          className="text-xl font-bold tracking-tight text-[#F5F5F7] focus-ring rounded transition-default hover:opacity-70"
          onClick={() => setActiveLink("Početak")}
        >
          RSBARBERSHOP
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={label === "Početak" && isAdmin ? "/" : href}
              className={`relative px-4 py-2.5 text-sm font-medium tracking-wide transition-default focus-ring ${
                activeLink === label || (label === "Admin" && isAdmin)
                  ? "text-[#F5F5F7] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#F5F5F7]"
                  : "text-[#6B6B70] hover:text-[#F5F5F7]"
              }`}
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
            className="hidden md:block min-h-[44px] rounded-sm bg-[#D3AF37] px-6 py-2.5 text-sm font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#E0C04A] active:scale-[0.98]"
          >
            Zakažite termin
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-sm text-[#F5F5F7] focus-ring md:hidden hover:bg-[#1A1A1F]"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <span className={`h-0.5 w-5 bg-current transition-transform ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-current transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-current transition-transform ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav
          className="flex flex-col gap-1 border-t border-[#2A2A2F] py-4 mt-4"
          aria-label="Mobile navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={label === "Početak" && isAdmin ? "/" : href}
              className={`px-4 py-3 text-base font-medium focus-ring transition-default border-l-2 ${
                activeLink === label
                  ? "border-[#F5F5F7] bg-[#1A1A1F] text-[#F5F5F7]"
                  : "border-transparent text-[#6B6B70] hover:text-[#F5F5F7] hover:bg-[#1A1A1F]/50"
              }`}
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
            className="mx-4 mt-3 min-h-[48px] rounded-sm bg-[#D3AF37] px-6 py-3.5 text-base font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#E0C04A]"
          >
            Zakažite termin
          </button>
        </nav>
      </div>
    </header>
  );
}
