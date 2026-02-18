"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop", alt: "Stilsko šišanje" },
  { src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop", alt: "Oblikovanje brade" },
  { src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop", alt: "Klasičan rez" },
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop", alt: "Fade šišanje" },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop", alt: "Precizno brijanje" },
  { src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop", alt: "Barbershop atmosfera" },
];

export function Gallery() {
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
      id="galerija"
      className="bg-[#1a1a1a] py-16 md:py-20 overflow-hidden"
      aria-labelledby="gallery-heading"
    >
      {/* Heading */}
      <div
        className={`text-center mb-8 md:mb-10 px-5 transition-all duration-[0.9s] ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <h2
          id="gallery-heading"
          className="font-heading text-[28px] text-white/80 leading-[1.3] sm:text-[32px] md:text-[42px] lg:text-[52px]"
        >
          LET YOUR HAIRSTYLE<br />
          DO THE TALKING
        </h2>
        <span className={`block h-[3px] w-16 bg-[#D4AF37] mt-4 mx-auto origin-center transition-transform duration-700 delay-300 ${inView ? "scale-x-100" : "scale-x-0"}`} />
      </div>

      {/* Image grid - staggered reveals + hover zoom */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {galleryImages.map((image, index) => (
          <div
            key={image.src}
            className={`relative aspect-square overflow-hidden group cursor-pointer transition-all duration-700 ${
              inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{
              transitionDelay: `${200 + index * 120}ms`,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, 33vw"
              loading="lazy"
            />
            {/* Hover overlay with text */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-500">
              <span className="text-white text-[11px] tracking-[0.2em] uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                {image.alt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
