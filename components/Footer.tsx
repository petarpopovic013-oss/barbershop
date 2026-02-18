"use client";

import { useEffect, useRef, useState } from "react";

export function Footer({ onBookClick }: { onBookClick?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={ref}
      className="bg-[#1a1a1a] border-t border-white/5 py-8 md:py-10"
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div
          className={`text-center transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <p className="text-[11px] tracking-[0.3em] text-white/50 md:text-[12px]">
            STAY SHARP.
          </p>
        </div>
      </div>
    </footer>
  );
}
