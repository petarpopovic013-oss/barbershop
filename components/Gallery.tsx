import Image from "next/image";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=700&fit=crop",
    alt: "Primer stila šišanja",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=700&fit=crop",
    alt: "Rezultat oblikovanja brade",
  },
  {
    src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=700&fit=crop",
    alt: "Klasičan rez",
  },
];

export function Gallery() {
  return (
    <section
      id="gallery"
      className="bg-[#141417] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div>
            <h2
              id="gallery-heading"
              className="mb-5 text-3xl font-bold tracking-tight text-[#F5F5F7] sm:text-4xl lg:text-5xl"
            >
              Naš rad
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-[#A1A1A6] sm:text-lg">
              Od fade-ova do klasičnih rezova i oblikovanja brade—pogledajte šta radimo svaki dan.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#6B6B70]">1 / {galleryImages.length}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-sm border border-[#3A3A40] text-[#A1A1A6] transition-default focus-ring hover:bg-[#F5F5F7] hover:border-[#F5F5F7] hover:text-[#0A0A0B]"
                  aria-label="Prethodna slika"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-sm border border-[#3A3A40] text-[#A1A1A6] transition-default focus-ring hover:bg-[#F5F5F7] hover:border-[#F5F5F7] hover:text-[#0A0A0B]"
                  aria-label="Sledeća slika"
                >
                  →
                </button>
              </div>
            </div>
          </div>
          
          {/* Image grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {galleryImages.map(({ src, alt }) => (
              <div
                key={src}
                className="relative aspect-[3/4] overflow-hidden rounded-sm border border-[#2A2A2F]"
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
