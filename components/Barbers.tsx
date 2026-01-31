"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const barbers = [
  {
    id: "barber-1",
    name: "Marko",
    role: "Master Barber",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    bio: "Marko brings over 12 years of experience to the chair. Specializing in classic cuts and modern fades, he believes a great haircut starts with understanding what each client wants.",
  },
  {
    id: "barber-2",
    name: "Stefan",
    role: "Senior Barber",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
    bio: "Stefan has been shaping style in the industry for 8 years. His passion is precision scissor work and beard grooming. He’s trained in both traditional and contemporary techniques.",
  },
  {
    id: "barber-3",
    name: "Nikola",
    role: "Barber",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    bio: "Nikola is our newest talent with a fresh perspective. He excels at textured cuts and creative styling. Always learning, he stays current with the latest trends and techniques.",
  },
];

export function Barbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`bg-[var(--surface-mid)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 ${inView ? "barbers-in-view" : ""}`}
      aria-labelledby="barbers-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="barbers-heading"
          className="mb-2 text-center font-serif text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
        >
          Meet our barbers
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm leading-relaxed text-[var(--foreground-muted)]">
          Three experienced barbers who care about detail and your comfort. Click
          an image to read their bio.
        </p>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map(({ id, name, role, image, bio }) => (
            <li
              key={id}
              className="barber-card barber-flip-card group h-[340px] opacity-0 [perspective:1000px]"
            >
              <div
                className={`barber-flip-inner focus-ring relative h-full w-full cursor-pointer rounded-[var(--radius-card)] transition-transform duration-500 outline-none [transform-style:preserve-3d] ${flippedId === id ? "[transform:rotateY(180deg)]" : ""}`}
                onClick={() => setFlippedId(flippedId === id ? null : id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFlippedId(flippedId === id ? null : id);
                  }
                }}
                aria-label={`${flippedId === id ? "Show" : "View"} ${name} bio`}
              >
                {/* Front */}
                <div className="barber-flip-front absolute inset-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] [backface-visibility:hidden]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={image}
                      alt={`${name}, ${role}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-mid)]/95 text-[var(--foreground-muted)]"
                      aria-hidden
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-serif text-sm font-medium tracking-tight text-[var(--foreground)]">
                      {name}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {role}
                    </p>
                  </div>
                </div>

                {/* Back – bio */}
                <div className="barber-flip-back absolute inset-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="flex h-full flex-col justify-center p-6">
                    <h3 className="mb-1 font-serif text-base font-semibold tracking-tight text-[var(--foreground)]">
                      {name}
                    </h3>
                    <p className="mb-3 text-xs uppercase tracking-wider text-[var(--accent)]">
                      {role}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
                      {bio}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
