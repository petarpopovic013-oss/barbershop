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
      <div className="relative z-20 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-4 py-12 sm:min-h-[85vh] sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8 lg:py-20">
        
        {/* Hero Headline - First on mobile, right on desktop */}
        <div className="order-1 flex flex-1 flex-col items-start justify-center lg:order-2">
          <h1 className="text-[2.5rem] font-bold leading-[1.15] tracking-tight text-[#F5F5F7] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-7xl">
            Gde tradicija <br className="hidden sm:block" />susreće{" "}
            <span className="block font-display italic font-normal text-[#D3AF37] sm:inline">moderan stil</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#A1A1A6] sm:mt-8 sm:text-lg lg:text-xl">
            Mesto gde se klasično berberstvo susreće sa savremenim stilom. Vrhunski rezovi i opuštena atmosfera u srcu Novog Sada.
          </p>
        </div>

        {/* Booking Card - Second on mobile, left on desktop */}
        <div className="order-2 mt-10 flex flex-1 flex-col justify-center sm:mt-12 lg:order-1 lg:mt-0 lg:max-w-md">
          <div className="rounded-sm bg-[#141417]/90 backdrop-blur-sm border border-[#2A2A2F] p-6 sm:p-8 lg:p-10">
            <h2 className="mb-3 text-xl font-semibold tracking-tight text-[#F5F5F7] sm:mb-4 sm:text-2xl lg:text-3xl">
              Zakažite termin
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-[#A1A1A6] sm:mb-8 sm:text-base lg:text-lg">
              Izaberite svog brijača i termin koji Vam odgovara. Mi ćemo potvrditi Vaš slot i spremiti sve za savršen izgled.
            </p>
            <button
              type="button"
              onClick={onBookClick}
              className="w-full min-h-[48px] rounded-sm bg-[#D3AF37] py-3.5 text-base font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#E0C04A] active:scale-[0.99] sm:min-h-[52px] sm:py-4 sm:text-lg"
            >
              Zakažite termin
            </button>
          </div>
        </div>
        
      </div>
      {children}
    </section>
  );
}
