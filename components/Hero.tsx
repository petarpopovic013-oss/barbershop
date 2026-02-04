import Image from "next/image";
import type { ReactNode } from "react";

export function Hero({
  onBookClick,
  children,
}: {
  onBookClick: () => void;
  children?: ReactNode;
}) {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] w-full overflow-hidden sm:min-h-[85vh]"
      aria-label="Hero section"
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/80 via-[#0A0A0B]/60 to-[#0A0A0B] z-10" />
      <Image
        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80"
        alt="Barber at work in the shop"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="relative z-20 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-between px-4 py-16 sm:min-h-[85vh] sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        {/* Booking Card */}
        <div className="flex flex-1 flex-col justify-center lg:max-w-md">
          <div className="rounded-[14px] bg-[#141417]/90 backdrop-blur-sm border border-[#2A2A2F] p-8 sm:p-10">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#F5F5F7] sm:text-3xl">
              Make an appointment
            </h2>
            <p className="mb-8 text-base leading-relaxed text-[#A1A1A6] sm:text-lg">
              Pick your preferred barber and time. We&apos;ll confirm your slot.
            </p>
            <button
              type="button"
              onClick={onBookClick}
              className="w-full min-h-[52px] rounded-lg bg-[#FFA400] py-4 text-base font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#FFB833] active:scale-[0.99] sm:text-lg"
            >
              Book appointment
            </button>
          </div>
          <p className="mt-8 max-w-md text-base leading-relaxed text-[#A1A1A6] sm:text-lg">
            A place where classic barbering meets today&apos;s style. Quality cuts and a relaxed atmosphere in the heart of Novi Sad.
          </p>
        </div>
        
        {/* Hero Headline */}
        <div className="mt-12 flex items-center lg:mt-0 lg:flex-1 lg:justify-end">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[#F5F5F7] sm:text-5xl md:text-6xl lg:text-7xl">
            Where tradition meets{" "}
            <span className="text-[#FFA400]">modern style</span>
          </h1>
        </div>
      </div>
      {children}
    </section>
  );
}
