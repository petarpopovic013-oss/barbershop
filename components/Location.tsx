"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function MapPinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function Location() {
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

  const contactItems = [
    { href: "tel:+38165345678", icon: PhoneIcon, text: "+381 65 345 678" },
    { href: "mailto:rsbarbershop@gmail.com", icon: EmailIcon, text: "rsbarbershop@gmail.com" },
    { href: "https://instagram.com/rs_barbershop", icon: InstagramIcon, text: "@rs_barbershop", external: true },
  ];

  return (
    <section
      ref={sectionRef}
      id="kontakt"
      className="bg-[#1a1a1a] py-16 md:py-20 lg:py-24 overflow-hidden"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">

          {/* Left column - Image and Hours */}
          <div
            className={`transition-all duration-[1s] ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {/* Image with hover zoom */}
            <div className="relative aspect-[4/3] overflow-hidden mb-8 group">
              <Image
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop"
                alt="Enterijer barbershopa"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            <h2
              id="contact-heading"
              className={`font-heading text-[28px] text-white mb-5 md:text-[32px] lg:text-[36px] transition-all duration-700 delay-300 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              POSETITE NAS
            </h2>
            <span className={`block h-[3px] w-12 bg-[#D4AF37] mb-5 origin-left transition-transform duration-700 delay-500 ${inView ? "scale-x-100" : "scale-x-0"}`} />

            <div className="space-y-3 text-[14px] text-white/80 md:text-[15px]">
              {[{ label: "Ponedeljak - Petak", time: "10h - 19h" }, { label: "Subota", time: "10h - 19h" }].map((slot, i) => (
                <div
                  key={slot.label}
                  className={`transition-all duration-600 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                  style={{ transitionDelay: `${600 + i * 120}ms` }}
                >
                  <p className="font-medium text-white">{slot.label}</p>
                  <p>{slot.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Contact Info and Map */}
          <div
            className={`transition-all duration-[1s] delay-200 ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <h3
              className={`font-heading text-[28px] text-white mb-5 md:text-[32px] lg:text-[36px] transition-all duration-700 delay-400 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              KONTAKT
            </h3>
            <span className={`block h-[3px] w-12 bg-[#D4AF37] mb-5 origin-left transition-transform duration-700 delay-[550ms] ${inView ? "scale-x-100" : "scale-x-0"}`} />

            {/* Contact items staggered */}
            <div className="space-y-3 mb-8">
              {contactItems.map((item, i) => (
                <a
                  key={item.text}
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`flex items-center gap-3 text-[14px] text-white/80 hover:text-white transition-all duration-500 md:text-[15px] group ${
                    inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                  }`}
                  style={{ transitionDelay: `${600 + i * 120}ms` }}
                >
                  <item.icon className="h-4 w-4 text-white/60 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.text}</span>
                </a>
              ))}
              <div
                className={`flex items-center gap-3 text-[14px] text-white/80 md:text-[15px] transition-all duration-500 ${
                  inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                }`}
                style={{ transitionDelay: "960ms" }}
              >
                <MapPinIcon className="h-4 w-4 text-white/60" />
                <span>Svetosavska 134, Kać</span>
              </div>
            </div>

            {/* Map with reveal */}
            <div
              className={`relative aspect-[4/3] overflow-hidden bg-[#333] transition-all duration-800 delay-500 ${
                inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2805.4!2d19.93!3d45.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDE1JzM2LjAiTiAxOcKwNTUnNDguMCJF!5e0!3m2!1sen!2srs!4v1000000000000!5m2!1sen!2srs"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokacija barbershopa"
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
