"use client";

import { useEffect, useRef, useState } from "react";

const prices = [
  { name: "ŠIŠANJE FADE", duration: "30 min.", price: "1.400" },
  { name: "KLASIČNO ŠIŠANJE", duration: "20 min.", price: "1.200" },
  { name: "BRADA", duration: null, price: "700" },
  { name: "ŠIŠANJE + BRADA", duration: null, price: "1.700" },
  { name: "BRIJANJE GLAVE", duration: null, price: "1.400" },
  { name: "KLASIČNO BRIJANJE", duration: null, price: "1.200" },
  { name: "PRANJE KOSE", duration: null, price: "700" },
];

export function Prices({ onBookClick }: { onBookClick?: () => void }) {
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
      id="cenovnik"
      className="bg-[#f7f7f7] py-20 md:py-28 lg:py-32 overflow-hidden"
      aria-labelledby="prices-heading"
    >
      <div className="mx-auto max-w-xl px-5 md:px-8">
        {/* Heading */}
        <div
          className={`text-center mb-10 md:mb-12 transition-all duration-[0.9s] ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <h2
            id="prices-heading"
            className="font-heading text-[48px] text-[#1a1a1a] md:text-[56px] lg:text-[64px]"
          >
            CENOVNIK
          </h2>
          <span className={`block h-[3px] w-16 bg-[#D4AF37] mt-3 mx-auto origin-center transition-transform duration-700 delay-300 ${inView ? "scale-x-100" : "scale-x-0"}`} />
        </div>

        {/* Price rows - staggered line-by-line reveal */}
        <div className="space-y-3">
          {prices.map((item, i) => (
            <div
              key={item.name}
              className={`price-row transition-all duration-600 ${
                inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              }`}
              style={{
                transitionDelay: `${300 + i * 100}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <span className="text-[13px] text-[#1a1a1a] whitespace-nowrap md:text-[14px]">
                {item.name}
                {item.duration && (
                  <span className="text-[#666666]"> ({item.duration})</span>
                )}
              </span>
              <span className="price-dots" />
              <span className="text-[13px] text-[#1a1a1a] whitespace-nowrap md:text-[14px]">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
