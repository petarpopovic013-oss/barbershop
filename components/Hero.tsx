"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Hero({
  onBookClick,
  children,
}: {
  onBookClick: () => void;
  children?: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setLoaded(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden bg-black"
      aria-label="Hero section"
    >
      {/* Video Background with monochrome filter */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-center grayscale transition-opacity duration-[2s] ${loaded ? "opacity-100" : "opacity-0"}`}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">

        {/* Logo - animated reveal (smaller on desktop/laptop) */}
        <div
          className={`relative w-[714px] h-[224px] sm:w-[569px] sm:h-[176px] md:w-[683px] md:h-[211px] lg:w-[854px] lg:h-[261px] max-w-[90vw] transition-all duration-[1.2s] cubic-bezier(0.16,1,0.3,1) ${
            loaded
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-[0.92] translate-y-5"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <Image
            src="/logobarber.png"
            alt="BARBERSHOP EST. 2020"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 90vw, (max-width: 1024px) 90vw, 854px"
          />
        </div>

        {/* CTA Button - slides up after logo (15% smaller, closer to logo on phone) */}
        <button
          type="button"
          onClick={onBookClick}
          className={`mt-[12px] cursor-pointer md:mt-5 font-bold rounded-full px-10 py-5 bg-white border border-white text-[#1a1a1a] text-[13px] tracking-[0.2em] uppercase transition-colors duration-150 hover:bg-[#333333] hover:border-[#333333] hover:text-white ${
            loaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          ZAKAŽI TERMIN
        </button>
      </div>

      {children}
    </section>
  );
}
