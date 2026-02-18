"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminDatePicker } from "@/components/AdminDatePicker";

const HOUR_START = 9;
const HOUR_END = 20;
const SLOT_MINUTES = 30;

type Barber = { id: number; name: string };
type Service = { id: number; service_name: string; price_rsd: number };
type Reservation = {
  id: number;
  barber_id: number;
  service_id: number | null;
  service_ids: number[] | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  start_time: string;
  end_time: string;
};

type Props = {
  barbers: Barber[];
  services: Service[];
  reservations: Reservation[];
  dateStr: string;
  barberFilter: string;
  fetchError: string | null;
};

function getLocalTimeString(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function timeSlots(): string[] {
  const slots: string[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

function pixelPerMinute(): number { return 2.2; }
function dayColumnHeightPx(): number { return (HOUR_END - HOUR_START) * 60 * pixelPerMinute(); }

export function AdminCalendar({ barbers, services, reservations, dateStr, barberFilter, fetchError }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const SLOT_DURATION = 30;
  const [selectedReservation, setSelectedReservation] = useState<{
    r: Reservation;
    services: Service[];
    totalPriceRsd: number;
    barber?: Barber;
  } | null>(null);

  const date = new Date(dateStr + "T12:00:00");
  const dayLabel = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  const updateParams = (updates: { date?: string; barber?: string }) => {
    const p = new URLSearchParams(searchParams.toString());
    if (updates.date !== undefined) p.set("date", updates.date);
    if (updates.barber !== undefined) p.set("barber", updates.barber);
    router.push(`/admin?${p.toString()}`);
  };

  const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const prevDay = () => { const d = new Date(date); d.setDate(d.getDate() - 1); updateParams({ date: toDateStr(d) }); };
  const nextDay = () => { const d = new Date(date); d.setDate(d.getDate() + 1); updateParams({ date: toDateStr(d) }); };

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));
  const displayBarbers = barberFilter === "all" || !barberFilter ? barbers : barbers.filter((b) => String(b.id) === barberFilter);
  const columns = displayBarbers.length || 1;
  const slots = timeSlots();
  const dayStartMinutes = HOUR_START * 60;
  const pxPerMin = pixelPerMinute();

  const getBlockStyle = (r: Reservation) => {
    const startDate = new Date(r.start_time);
    const endDate = new Date(r.end_time);
    const startM = startDate.getHours() * 60 + startDate.getMinutes() - dayStartMinutes;
    const durationM = (endDate.getTime() - startDate.getTime()) / 60000;
    return { top: `${startM * pxPerMin}px`, height: `${Math.max(durationM * pxPerMin, 28)}px` };
  };

  const handleLogout = async () => { await fetch("/api/admin/auth", { method: "DELETE" }); router.push("/admin/login"); router.refresh(); };
  const datesWithReservations = new Set(reservations.length > 0 ? [dateStr] : []);

  return (
    <div className="admin-dashboard mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F7] sm:text-4xl">Admin Panel</h1>
          <p className="mt-1 text-base text-[#A1A1A6]">Upravljanje rezervacijama i rasporedom</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/admin/availability"
            className="admin-btn-secondary flex items-center gap-2 min-h-[44px] rounded-lg border border-[#2A2A2F] px-5 py-2.5 text-sm font-medium text-[#A1A1A6] transition-all hover:border-[#3A3A40] hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Dostupnost berbera
          </a>
          <button type="button" onClick={handleLogout}
            className="admin-btn-secondary flex items-center gap-2 min-h-[44px] rounded-lg border border-[#2A2A2F] px-5 py-2.5 text-sm font-medium text-[#A1A1A6] transition-all hover:border-[#3A3A40] hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Odjavi se
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Sidebar */}
        <aside className="shrink-0 lg:w-72">
          <div className="sticky top-6 space-y-5">
            <AdminDatePicker value={dateStr} onChange={(d) => updateParams({ date: d })} datesWithReservations={datesWithReservations} />

            <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-5">
              <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-[#A1A1A6]">Filtriraj po berberu</label>
              <select value={barberFilter} onChange={(e) => updateParams({ barber: e.target.value })}
                className="admin-select w-full min-h-[44px] rounded-lg border border-[#2A2A2F] bg-[#0A0A0B] px-4 py-2.5 text-sm text-[#F5F5F7] transition-colors focus:border-[#D3AF37] focus:outline-none focus:ring-2 focus:ring-[#D3AF37]/25">
                <option value="all">Svi berberi</option>
                {barbers.map((b) => (<option key={b.id} value={String(b.id)}>{b.name}</option>))}
              </select>
            </div>

            <div className="flex items-center gap-1 rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-2">
              <button type="button" onClick={prevDay}
                className="flex flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-lg py-2.5 text-sm font-medium text-[#A1A1A6] transition-colors hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                Prethodni
              </button>
              <button type="button" onClick={nextDay}
                className="flex flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-lg py-2.5 text-sm font-medium text-[#A1A1A6] transition-colors hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring">
                Sledeći
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {fetchError && (
            <div className="admin-alert mb-6 flex items-center gap-3 rounded-[14px] border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {fetchError}
            </div>
          )}

          <div className="admin-schedule-card overflow-hidden rounded-[20px] border border-[#2A2A2F] bg-[#141417] shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2A2F] bg-[#1A1A1F] px-6 py-5">
              <h2 className="text-xl font-bold tracking-tight text-[#F5F5F7]">Raspored — {dayLabel}</h2>
              <span className="rounded-full bg-[#D3AF37] px-4 py-1.5 text-xs font-semibold text-[#0A0A0B]">
                {reservations.length} {reservations.length === 1 ? "zakazivanje" : reservations.length >= 2 && reservations.length <= 4 ? "zakazivanja" : "zakazivanja"}
              </span>
            </div>

            <div className="overflow-x-auto">
              {reservations.length === 0 && !fetchError ? (
                <div className="admin-empty-state flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#1A1A1F] text-[#6B6B70]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-[#F5F5F7]">Nema rezervacija za ovaj dan</p>
                  <p className="mt-1 text-sm text-[#6B6B70]">Izaberite drugi datum ili proverite kasnije</p>
                </div>
              ) : (
                <div className="admin-schedule-grid grid min-w-[580px]"
                  style={{ gridTemplateColumns: `72px repeat(${columns}, minmax(150px, 1fr))`, gridTemplateRows: `auto repeat(${slots.length}, ${SLOT_MINUTES * pxPerMin}px)` }}>
                  <div className="border-r border-b border-[#2A2A2F] bg-[#1A1A1F] p-2" style={{ gridColumn: 1, gridRow: 1 }} />
                  {displayBarbers.map((b, colIndex) => (
                    <div key={b.id} className="border-b border-r border-[#2A2A2F] bg-[#1A1A1F] px-3 py-4 text-center text-sm font-semibold text-[#F5F5F7]"
                      style={{ gridColumn: colIndex + 2, gridRow: 1 }}>{b.name}</div>
                  ))}
                  {displayBarbers.length === 0 && (
                    <div className="border-b border-r border-[#2A2A2F] px-3 py-4 text-center text-sm text-[#6B6B70]" style={{ gridColumn: 2, gridRow: 1 }}>—</div>
                  )}
                  {slots.map((slot, rowIndex) => (
                    <div key={slot} className="border-r border-b border-[#2A2A2F] py-1.5 pr-2 text-right text-xs font-medium text-[#6B6B70]"
                      style={{ gridColumn: 1, gridRow: rowIndex + 2 }}>{slot}</div>
                  ))}
                  {displayBarbers.length > 0 && displayBarbers.map((barber, colIndex) => {
                    const colReservations = reservations.filter((r) => r.barber_id === barber.id);
                    return (
                      <div key={barber.id} className="relative border-r border-[#2A2A2F] last:border-r-0"
                        style={{ gridColumn: colIndex + 2, gridRow: "2 / -1", minHeight: `${dayColumnHeightPx()}px`, overflow: "visible" }}>
                        {colReservations.map((r) => {
                          const ids = (r.service_ids && r.service_ids.length > 0) ? r.service_ids : (r.service_id != null ? [r.service_id] : []);
                          const reservationServices = ids.map((id) => serviceMap[id]).filter(Boolean) as Service[];
                          const serviceLabel = reservationServices.length > 0
                            ? reservationServices.map((s) => s.service_name).join(", ")
                            : "Usluga";
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setSelectedReservation({
                                r,
                                services: reservationServices,
                                totalPriceRsd: reservationServices.reduce((sum, s) => sum + Number(s.price_rsd ?? 0), 0),
                                barber,
                              })}
                              className="admin-reservation-block absolute left-1.5 right-1.5 rounded-lg border border-[#D3AF37]/40 bg-[#D3AF37]/15 px-3 py-2 text-left text-xs transition-all hover:border-[#D3AF37]/70 hover:bg-[#D3AF37]/25 focus-ring"
                              style={getBlockStyle(r)}
                            >
                              <span className="block truncate font-semibold text-[#F5F5F7]">{r.customer_name || r.customer_phone || "—"}</span>
                              <span className="block truncate text-[#A1A1A6]">{serviceLabel}</span>
                              <span className="block truncate text-[10px] text-[#6B6B70]">{getLocalTimeString(r.start_time)}–{getLocalTimeString(r.end_time)}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <section className="mt-12" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="mb-5 text-xl font-bold tracking-tight text-[#F5F5F7]">Pregled</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-6">
                <p className="text-3xl font-bold text-[#F5F5F7]">{reservations.length}</p>
                <p className="mt-1 text-sm text-[#A1A1A6]">Današnja zakazivanja</p>
              </div>
              <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-6">
                <p className="text-3xl font-bold text-[#F5F5F7]">{barbers.length}</p>
                <p className="mt-1 text-sm text-[#A1A1A6]">Aktivni berberi</p>
              </div>
              <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-6">
                <p className="text-3xl font-bold text-[#F5F5F7]">{services.length}</p>
                <p className="mt-1 text-sm text-[#A1A1A6]">Ponuđene usluge</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Reservation details modal */}
      {selectedReservation && (
        <div className="admin-modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedReservation(null)} role="dialog" aria-modal="true" aria-labelledby="reservation-dialog-title">
          <div className="admin-modal-content w-full max-w-md rounded-[20px] border border-[#2A2A2F] bg-[#141417] p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 id="reservation-dialog-title" className="text-xl font-bold text-[#F5F5F7]">Detalji rezervacije</h3>
                <p className="mt-1 text-sm text-[#A1A1A6]">{getLocalTimeString(selectedReservation.r.start_time)} – {getLocalTimeString(selectedReservation.r.end_time)}</p>
              </div>
              <button type="button" onClick={() => setSelectedReservation(null)}
                className="rounded-lg p-2 text-[#A1A1A6] transition-colors hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring" aria-label="Zatvori">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <dl className="space-y-5">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[#6B6B70]">Korisnik</dt>
                <dd className="mt-1 font-medium text-[#F5F5F7]">{selectedReservation.r.customer_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[#6B6B70]">Telefon</dt>
                <dd className="mt-1 text-[#F5F5F7]">
                  <a href={`tel:${selectedReservation.r.customer_phone}`} className="text-[#009FFD] hover:text-[#33B3FF] hover:underline">{selectedReservation.r.customer_phone}</a>
                </dd>
              </div>
              {selectedReservation.r.customer_email && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[#6B6B70]">Imejl</dt>
                  <dd className="mt-1 text-[#F5F5F7]">
                    <a href={`mailto:${selectedReservation.r.customer_email}`} className="text-[#009FFD] hover:text-[#33B3FF] hover:underline">{selectedReservation.r.customer_email}</a>
                  </dd>
                </div>
              )}
              <div className="flex gap-8">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[#6B6B70]">Berber</dt>
                  <dd className="mt-1 text-[#F5F5F7]">{selectedReservation.barber?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[#6B6B70]">Usluge</dt>
                  <dd className="mt-1 text-[#F5F5F7]">
                    {selectedReservation.services.length > 0
                      ? selectedReservation.services.map((s) => s.service_name).join(", ")
                      : "—"}
                    {selectedReservation.services.length > 0 && (
                      <span className="ml-1 text-[#A1A1A6]">({SLOT_DURATION} min · {selectedReservation.totalPriceRsd} RSD)</span>
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
