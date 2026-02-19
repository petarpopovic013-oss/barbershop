"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function ScissorsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export function Barbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tim"
      className="bg-[#1a1a1a] py-8 md:py-11 lg:py-14 overflow-hidden"
      aria-labelledby="team-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left - Image: slides in from left */}
          <div
            className={`transition-all duration-[1s] ${
              inView
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-16"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="relative aspect-square overflow-hidden rounded-lg mx-auto max-w-[340px] lg:max-w-none group">
              <Image
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop"
                alt="Profesionalni berber na poslu"
                fill
                className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
          </div>

          {/* Right - Text: slides in from right */}
          <div
            className={`text-center lg:text-left transition-all duration-[1s] delay-200 ${
              inView
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-16"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {/* Scissors divider with line-grow animation */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
              <span
                className={`h-[1px] w-10 bg-white/60 origin-right transition-transform duration-700 delay-500 ${inView ? "scale-x-100" : "scale-x-0"}`}
              />
              <ScissorsIcon
                className={`h-4 w-4 text-white/60 transition-all duration-500 delay-700 ${inView ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
              />
              <span
                className={`h-[1px] w-10 bg-white/60 origin-left transition-transform duration-700 delay-500 ${inView ? "scale-x-100" : "scale-x-0"}`}
              />
            </div>

            <h2
              id="team-heading"
              className={`font-heading text-[48px] text-white md:text-[56px] lg:text-[64px] transition-all duration-[0.9s] delay-300 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              NAŠ TIM
            </h2>

            {/* Accent underline grows in */}
            <span className={`block h-[3px] w-16 bg-white mt-3 origin-left transition-transform duration-700 delay-500 mx-auto lg:mx-0 ${inView ? "scale-x-100" : "scale-x-0"}`} />

            <p
              className={`mt-5 text-[16px] font-medium italic text-white/90 md:text-[18px] transition-all duration-700 delay-[500ms] ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Mladi tim, sveža energija i preciznost u svakom potezu.
            </p>

            <p
              className={`mt-4 text-[14px] leading-[1.8] text-white/70 md:text-[15px] transition-all duration-700 delay-[650ms] ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Kombinujemo znanje, ambiciju i savremene trendove, stvarajući balans tradicije i modernog stila. Svakom klijentu pristupamo individualno, sa fokusom na detalje, stil i vrhunski rezultat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
