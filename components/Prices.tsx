import { Fragment } from "react";

const sisanjePrices = [
  { name: "Šišanje Mašinica", price: "1100din" },
  { name: "Šišanje Mašinica + Makaze", price: "1200din" },
  { name: "Šišanje Nula", price: "500din" },
];

const brijanjePrices = [{ name: "Shaver", price: "200din" }];

const bradaPrices = [
  { name: "Brada Kratka", price: "400din" },
  { name: "Brada Duga", price: "500din" },
  { name: "Brada Nula", price: "200din" },
];

const ostaloPrices = [{ name: "Pranje Kose", price: "250din" }];

const priceCategories: { title: string; items: { name: string; price: string }[] }[] = [
  { title: "Šišanje", items: sisanjePrices },
  { title: "Brijanje", items: brijanjePrices },
  { title: "Brada", items: bradaPrices },
  { title: "Ostalo", items: ostaloPrices },
];

export function Prices({ onBookClick }: { onBookClick?: () => void }) {
  return (
    <section
      id="prices"
      className="relative bg-[var(--surface-beige)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="prices-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="prices-heading"
          className="mb-10 font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
        >
          Our prices
        </h2>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-muted)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-muted)] bg-[var(--surface-mid)]">
                <th
                  scope="col"
                  className="px-6 py-4 font-serif text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-serif text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]"
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {priceCategories.map(({ title, items }) => (
                <Fragment key={title}>
                  <tr>
                    <td
                      colSpan={2}
                      className="bg-[var(--surface-dark)] px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-white"
                    >
                      {title}
                    </td>
                  </tr>
                  {items.map(({ name, price }) => (
                    <tr
                      key={name}
                      className="border-b border-[var(--border-subtle)] transition-default hover:bg-[var(--surface-mid)]/60 last:border-b-0"
                    >
                      <td className="px-6 py-4 text-base text-[var(--foreground)]">{name}</td>
                      <td className="px-6 py-4 text-right font-semibold text-[var(--accent)]">
                        {price}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6">
          <p className="text-base text-[var(--foreground-muted)]">
            Ready for a sharp look? Book your slot with us.
          </p>
          <button
            type="button"
            onClick={onBookClick}
            className="shrink-0 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)] active:scale-[0.99]"
          >
            Book appointment
          </button>
        </div>
      </div>
    </section>
  );
}
