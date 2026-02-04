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
    bio: "Stefan has been shaping style in the industry for 8 years. His passion is precision scissor work and beard grooming. He's trained in both traditional and contemporary techniques.",
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
      className={`bg-[#0A0A0B] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32 ${inView ? "barbers-in-view" : ""}`}
      aria-labelledby="barbers-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14 lg:mb-20">
          <h2
            id="barbers-heading"
            className="mb-4 text-3xl font-bold tracking-tight text-[#F5F5F7] sm:text-4xl lg:text-5xl"
          >
            Meet our barbers
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-[#A1A1A6] sm:text-lg">
            Three experienced barbers who care about detail and your comfort. Click
            an image to read their bio.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {barbers.map(({ id, name, role, image, bio }) => (
            <li
              key={id}
              className="barber-card barber-flip-card group h-[400px] opacity-0 [perspective:1000px]"
            >
              <div
                className={`barber-flip-inner focus-ring relative h-full w-full cursor-pointer rounded-[14px] transition-transform duration-500 outline-none [transform-style:preserve-3d] ${flippedId === id ? "[transform:rotateY(180deg)]" : ""}`}
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
                <div className="barber-flip-front absolute inset-0 overflow-hidden rounded-[14px] bg-[#141417] border border-[#2A2A2F] transition-all hover:border-[#3A3A40] [backface-visibility:hidden]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={image}
                      alt={`${name}, ${role}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-lg font-semibold tracking-tight text-[#F5F5F7]">
                      {name}
                    </p>
                    <p className="text-sm text-[#FFA400]">
                      {role}
                    </p>
                  </div>
                </div>

                {/* Back – bio */}
                <div className="barber-flip-back absolute inset-0 overflow-hidden rounded-[14px] bg-[#141417] border border-[#2A2A2F] [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="flex h-full flex-col justify-center p-8">
                    <h3 className="mb-2 text-xl font-bold tracking-tight text-[#F5F5F7]">
                      {name}
                    </h3>
                    <p className="mb-4 text-sm font-medium uppercase tracking-wider text-[#FFA400]">
                      {role}
                    </p>
                    <p className="text-base leading-relaxed text-[#A1A1A6]">
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
