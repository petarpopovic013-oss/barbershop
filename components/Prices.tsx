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
      className="relative bg-[#141417] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
      aria-labelledby="prices-heading"
    >
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-14 lg:mb-20">
          <h2
            id="prices-heading"
            className="mb-4 text-3xl font-bold tracking-tight text-[#F5F5F7] sm:text-4xl lg:text-5xl"
          >
            Our prices
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-[#A1A1A6] sm:text-lg">
            Transparent pricing for all our services. Quality cuts at fair prices.
          </p>
        </div>
        
        <div className="overflow-hidden rounded-[14px] border border-[#2A2A2F] bg-[#0A0A0B]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#2A2A2F]">
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#A1A1A6]"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#A1A1A6]"
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
                      className="bg-[#1A1A1F] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#FFA400]"
                    >
                      {title}
                    </td>
                  </tr>
                  {items.map(({ name, price }) => (
                    <tr
                      key={name}
                      className="border-b border-[#2A2A2F] transition-default hover:bg-[#1A1A1F] last:border-b-0"
                    >
                      <td className="px-6 py-4 text-base text-[#F5F5F7]">{name}</td>
                      <td className="px-6 py-4 text-right font-semibold text-[#FFA400]">
                        {price}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-center">
          <p className="text-base text-[#A1A1A6]">
            Ready for a sharp look? Book your slot with us.
          </p>
          <button
            type="button"
            onClick={onBookClick}
            className="shrink-0 min-h-[48px] rounded-lg bg-[#FFA400] px-8 py-3 text-base font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#FFB833] active:scale-[0.99]"
          >
            Book appointment
          </button>
        </div>
      </div>
    </section>
  );
}
