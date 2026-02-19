"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const services = [
  {
    image: "/Makaze.png",
    title: "Muško šišanje",
    description: "Precizno šišanje prilagođeno tvom stilu.",
  },
  {
    image: "/Trimer.png",
    title: "Trimovanje brade",
    description: "Uređivanje brade uz savršenu definiciju i čiste linije.",
  },
  {
    image: "/Britva.png",
    title: "Brijanje britvom",
    description: "Precizno brijanje britvom za besprekoran rezultat.",
  },
  {
    image: "/Proizvod.png",
    title: "Premium proizvodi",
    description: "Koristimo proverene premium proizvode za negu kose i brade.",
  },
];

export function Services({ onBookClick }: { onBookClick?: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="usluge"
      className="bg-white py-20 md:py-28 lg:py-32 overflow-hidden"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left - Text: slides in from left, centered on mobile */}
          <div
            className={`flex flex-col items-center text-center lg:items-start lg:text-left transition-all duration-[1s] ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <h2
              id="services-heading"
              className="font-heading text-[48px] text-[#1a1a1a] md:text-[56px] lg:text-[64px]"
            >
              USLUGE
            </h2>

            {/* Accent underline grows in */}
            <span className={`block h-[3px] w-16 bg-[#1a1a1a] mt-3 origin-center lg:origin-left transition-transform duration-700 delay-300 ${inView ? "scale-x-100" : "scale-x-0"}`} />

            <p
              className={`mt-5 text-[16px] font-medium text-[#1a1a1a] md:text-[17px] transition-all duration-700 delay-300 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Profesionalan pristup, savremeni trendovi i osećaj premium nege.
            </p>

            <p
              className={`mt-4 text-[14px] leading-[1.8] text-[#666666] md:text-[15px] transition-all duration-700 delay-[450ms] ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Od preciznog šišanja i besprekornog fade-a do detaljnog oblikovanja i brijanja brade, svaki tretman izvodimo sa maksimalnom posvećenošću i vrhunskom tehnikom.
            </p>

            <button
              type="button"
              onClick={onBookClick}
              className={`mt-8 cursor-pointer font-bold rounded-full px-8 py-4 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] text-[11px] tracking-[0.2em] uppercase transition-colors duration-150 hover:bg-[#1a1a1a] hover:border-[#1a1a1a] hover:text-white ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              ZAKAŽI TERMIN
            </button>
          </div>

          {/* Right - 2x2 Service grid with staggered card reveals, centered on mobile */}
          <div className="grid grid-cols-2 border border-[#e5e5e5] w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`flex flex-col items-center text-center p-6 md:p-8 transition-all duration-700 ${
                  index % 2 === 0 ? "border-r border-[#e5e5e5]" : ""
                } ${
                  index < 2 ? "border-b border-[#e5e5e5]" : ""
                } ${
                  inView ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-6"
                }`}
                style={{
                  transitionDelay: `${200 + index * 150}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div className={`relative mb-4 h-[54px] w-[54px] md:h-[68px] md:w-[68px] transition-transform duration-500 ${inView ? "rotate-0" : "rotate-12"}`}>
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    className="object-contain grayscale"
                    sizes="(max-width: 768px) 54px, 68px"
                  />
                </div>
                <h3 className="font-heading text-[17px] text-[#1a1a1a] mb-2 md:text-[18px]">
                  {service.title}
                </h3>
                <p className="text-[12px] text-[#666666] leading-[1.6] md:text-[13px]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
