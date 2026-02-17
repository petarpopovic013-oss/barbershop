import Link from "next/link";

const menuLinks = [
  { href: "#home", label: "Početak" },
  { href: "#about", label: "Naši berberi" },
  { href: "#prices", label: "Naše cene" },
  { href: "#visit", label: "Posetite nas" },
  { href: "#gallery", label: "Naš rad" },
  { href: "#contact", label: "Kontakt" },
];

const quickLinks = [
  { href: "#", label: "Karijera" },
  { href: "#", label: "Privatnost" },
  { href: "#contact", label: "Lokacija i kontakt" },
];

export function Footer({ onBookClick }: { onBookClick: () => void }) {
  return (
    <footer
      id="contact"
      className="bg-[#0A0A0B] border-t border-[#2A2A2F] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand & Contact */}
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#F5F5F7]">
              RSBARBERSHOP
            </p>
            <p className="mt-4 text-base text-[#A1A1A6] leading-relaxed">
              Example Street 1<br />
              21000 Novi Sad
            </p>
            <p className="mt-3 text-base">
              <a href="tel:+381123456789" className="text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors focus-ring rounded">
                +381 12 345 6789
              </a>
            </p>
            <p className="mt-1 text-base">
              <a href="mailto:hello@example.com" className="text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors focus-ring rounded">
                hello@example.com
              </a>
            </p>
            <div className="mt-6 flex gap-3" aria-label="Social links">
              {["Facebook", "Instagram", "Twitter"].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#1A1A1F] border border-[#2A2A2F] text-[#A1A1A6] transition-all focus-ring hover:bg-[#F5F5F7] hover:text-[#0A0A0B] hover:border-[#F5F5F7]"
                  aria-label={name}
                >
                  <span className="text-sm font-medium">{name[0]}</span>
                </a>
              ))}
            </div>
          </div>
          
          {/* Menu */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F7]">
              Meni
            </h3>
            <ul className="mt-5 space-y-3">
              {menuLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-base text-[#6B6B70] hover:text-[#F5F5F7] transition-colors focus-ring rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F7]">
              Brzi linkovi
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-base text-[#6B6B70] hover:text-[#F5F5F7] transition-colors focus-ring rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Hours & CTA */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F7]">
              Radno vreme
            </h3>
            <p className="mt-5 text-base text-[#A1A1A6] leading-relaxed">
              Pon–Pet 9:00–20:00<br />
              Sub 9:00–16:00
            </p>
            <button
              type="button"
              onClick={onBookClick}
              className="mt-8 w-full min-h-[48px] rounded-sm bg-[#D3AF37] py-3.5 px-6 text-base font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#E0C04A] sm:w-auto"
            >
              Zakažite termin
            </button>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-16 border-t border-[#2A2A2F] pt-8">
          <p className="text-center text-sm text-[#6B6B70]">
            © RSBARBERSHOP Novi Sad. Sva prava zadržana.
          </p>
        </div>
      </div>
    </footer>
  );
}
