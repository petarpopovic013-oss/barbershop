const iconClass = "h-5 w-5";

function LocationIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function Location() {
  return (
    <section
      id="visit"
      className="bg-[#0A0A0B] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-3 lg:gap-12">
        {/* Left content */}
        <div className="lg:col-span-2">
          <h2
            id="location-heading"
            className="mb-5 text-3xl font-bold tracking-tight text-[#F5F5F7] sm:text-4xl lg:text-5xl"
          >
            Posetite nas
          </h2>
          <p className="mb-8 max-w-lg text-base leading-relaxed text-[#A1A1A6] sm:text-lg">
            Nalazimo se u centru Novog Sada. Primamo i bez zakazivanja kada imamo slobodne termine—ali zakažite unapred da obezbedite svoje mesto.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 min-h-[48px] rounded-sm bg-[#D3AF37] px-6 py-3.5 text-base font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#E0C04A]"
          >
            Dobijte putanju
            <span aria-hidden>→</span>
          </a>
        </div>
        
        {/* Info cards */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 rounded-sm bg-[#141417] border border-[#2A2A2F] p-5">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#1A1A1F] border border-[#3A3A40] text-[#F5F5F7]"
              aria-hidden
            >
              <LocationIcon />
            </span>
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F7]">
                Adresa
              </h3>
              <p className="mt-2 text-base text-[#A1A1A6] leading-relaxed">
                Example Street 1<br />
                21000 Novi Sad
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 rounded-sm bg-[#141417] border border-[#2A2A2F] p-5">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#1A1A1F] border border-[#3A3A40] text-[#F5F5F7]"
              aria-hidden
            >
              <ClockIcon />
            </span>
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F7]">
                Radno vreme i kontakt
              </h3>
              <p className="mt-2 text-base text-[#A1A1A6] leading-relaxed">
                Pon–Pet 9:00–20:00<br />
                Sub 9:00–16:00
              </p>
              <a
                href="tel:+381123456789"
                className="mt-3 inline-block text-[#009FFD] hover:text-[#33B3FF] transition-colors focus-ring rounded"
              >
                +381 12 345 6789
              </a>
            </div>
          </div>
        </div>
        
        {/* Map placeholder */}
        <div className="lg:col-span-3">
          <div
            className="rounded-sm bg-[#141417] border border-[#2A2A2F] h-72 w-full overflow-hidden lg:h-80"
            aria-hidden
          >
            <div className="flex h-full w-full items-center justify-center text-[#6B6B70] text-lg">
              Mapa
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
