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

  const allReservationsWithInfo = reservations.map((r) => {
    const ids = (r.service_ids && r.service_ids.length > 0) ? r.service_ids : (r.service_id != null ? [r.service_id] : []);
    const reservationServices = ids.map((id) => serviceMap[id]).filter(Boolean) as Service[];
    const barber = barbers.find((b) => b.id === r.barber_id);
    return { r, services: reservationServices, barber };
  });

  return (
    <div className="admin-dashboard mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 border-b border-white/10 pb-6 sm:mb-12 sm:pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="font-heading text-[32px] text-white sm:text-[42px] md:text-[48px] lg:text-[56px]">ADMIN PANEL</h1>
            <span className="mt-2 block h-[3px] w-12 bg-white/70 sm:mt-3 sm:w-16" />
            <p className="mt-3 text-[13px] text-white/60 sm:mt-4 sm:text-[15px]">Upravljanje rezervacijama i rasporedom</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/admin/availability"
              className="flex items-center gap-1.5 min-h-[40px] rounded-full border-2 border-white/20 bg-transparent px-4 py-2 text-[10px] font-bold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] sm:min-h-[44px] sm:px-6 sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] sm:gap-2 focus-ring">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="hidden xs:inline">Dostupnost</span>
              <span className="xs:hidden">Dost.</span>
            </a>
            <button type="button" onClick={handleLogout}
              className="flex items-center gap-1.5 min-h-[40px] rounded-full border-2 border-white/20 bg-transparent px-4 py-2 text-[10px] font-bold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] sm:min-h-[44px] sm:px-6 sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] sm:gap-2 focus-ring">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Odjavi se
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Sidebar */}
        <aside className="shrink-0 lg:w-80">
          <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6">
            <AdminDatePicker value={dateStr} onChange={(d) => updateParams({ date: d })} datesWithReservations={datesWithReservations} />

            <div className="rounded-[16px] border border-white/10 bg-[#1a1a1a] p-4 sm:rounded-[20px] sm:p-6">
              <label className="mb-3 block font-heading text-[12px] uppercase tracking-widest text-white/80 sm:mb-4 sm:text-[13px]">Filtriraj po berberu</label>
              <select value={barberFilter} onChange={(e) => updateParams({ barber: e.target.value })}
                className="w-full min-h-[44px] rounded-full border-2 border-white/20 bg-[#141417] px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 focus:border-[#525252] focus:outline-none focus:ring-2 focus:ring-[#525252]/50 sm:min-h-[48px] sm:px-5 sm:py-3">
                <option value="all">Svi berberi</option>
                {barbers.map((b) => (<option key={b.id} value={String(b.id)}>{b.name}</option>))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-[16px] border border-white/10 bg-[#1a1a1a] p-1.5 sm:rounded-[20px] sm:p-2">
              <button type="button" onClick={prevDay}
                className="flex flex-1 items-center justify-center gap-1.5 min-h-[42px] rounded-full border-2 border-white/20 bg-transparent py-2 text-[10px] font-bold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] sm:min-h-[48px] sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] sm:gap-2 focus-ring">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                Prethodni
              </button>
              <button type="button" onClick={nextDay}
                className="flex flex-1 items-center justify-center gap-1.5 min-h-[42px] rounded-full border-2 border-white/20 bg-transparent py-2 text-[10px] font-bold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] sm:min-h-[48px] sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] sm:gap-2 focus-ring">
                Sledeći
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {fetchError && (
            <div className="admin-alert mb-4 flex items-center gap-3 rounded-[16px] border-2 border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400 sm:mb-6 sm:rounded-[20px] sm:px-6 sm:py-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{fetchError}</span>
            </div>
          )}

          {/* Schedule card */}
          <div className="admin-schedule-card overflow-hidden rounded-[16px] border border-white/10 bg-[#141417] shadow-xl sm:rounded-[20px]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#141417] px-4 py-4 sm:gap-4 sm:px-8 sm:py-6">
              <div className="min-w-0">
                <h2 className="font-heading text-[22px] text-white sm:text-[28px] md:text-[32px]">RASPORED</h2>
                <p className="mt-0.5 truncate text-[12px] text-white/60 sm:mt-1 sm:text-[14px]">{dayLabel}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#404040] px-3 py-1.5 text-[10px] font-black tracking-wider text-white uppercase sm:px-5 sm:py-2 sm:text-[12px]">
                {reservations.length} {reservations.length === 1 ? "rez." : "rez."}
              </span>
            </div>

            {/* Mobile: card list view */}
            <div className="block md:hidden">
              {reservations.length === 0 && !fetchError ? (
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 text-white/70">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="font-heading text-[16px] text-white/90">NEMA REZERVACIJA</p>
                  <p className="mt-1.5 text-[12px] text-white/50">Izaberite drugi datum</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {allReservationsWithInfo.map(({ r, services: rServices, barber }) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReservation({
                        r,
                        services: rServices,
                        totalPriceRsd: rServices.reduce((sum, s) => sum + Number(s.price_rsd ?? 0), 0),
                        barber,
                      })}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5 active:bg-white/8 focus-ring"
                    >
                      <div className="shrink-0 pt-0.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white/90">
                          {getLocalTimeString(r.start_time)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-white">{r.customer_name || r.customer_phone || "—"}</p>
                        <p className="truncate text-[12px] text-white/60">
                          {rServices.length > 0 ? rServices.map((s) => s.service_name).join(", ") : "Usluga"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/40">
                          {barber?.name ?? "—"} · {getLocalTimeString(r.start_time)}–{getLocalTimeString(r.end_time)}
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-2 text-white/30"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: grid schedule view */}
            <div className="hidden md:block overflow-x-auto bg-[#141417]">
              {reservations.length === 0 && !fetchError ? (
                <div className="admin-empty-state flex flex-col items-center justify-center px-6 py-24 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 text-white/70">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="font-heading text-[18px] text-white/90 md:text-[20px]">NEMA REZERVACIJA</p>
                  <p className="mt-2 text-[13px] text-white/50">Izaberite drugi datum ili proverite kasnije</p>
                </div>
              ) : (
                <div className="admin-schedule-grid grid min-w-[580px] bg-[#141417]"
                  style={{ gridTemplateColumns: `72px repeat(${columns}, minmax(150px, 1fr))`, gridTemplateRows: `auto repeat(${slots.length}, ${SLOT_MINUTES * pxPerMin}px)` }}>
                  <div className="border-r border-b border-white/10 bg-[#141417] p-2" style={{ gridColumn: 1, gridRow: 1 }} />
                  {displayBarbers.map((b, colIndex) => (
                    <div key={b.id} className="border-b border-r border-white/10 bg-[#141417] px-4 py-4 text-center font-heading text-[13px] uppercase tracking-wider text-white/90"
                      style={{ gridColumn: colIndex + 2, gridRow: 1 }}>{b.name}</div>
                  ))}
                  {displayBarbers.length === 0 && (
                    <div className="border-b border-r border-white/10 bg-[#141417] px-3 py-4 text-center text-sm text-white/40" style={{ gridColumn: 2, gridRow: 1 }}>—</div>
                  )}
                  {slots.map((slot, rowIndex) => (
                    <div key={slot} className="border-r border-b border-white/10 bg-[#141417] py-2 pr-3 text-right text-[11px] font-medium tracking-wider text-white/50"
                      style={{ gridColumn: 1, gridRow: rowIndex + 2 }}>{slot}</div>
                  ))}
                  {displayBarbers.length > 0 && displayBarbers.map((barber, colIndex) => {
                    const colReservations = reservations.filter((r) => r.barber_id === barber.id);
                    return (
                      <div key={barber.id} className="relative border-r border-white/10 last:border-r-0 bg-[#141417]"
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
                              className="admin-reservation-block absolute left-2 right-2 rounded-lg border border-white/25 bg-white/5 px-4 py-2.5 text-left text-xs transition-all duration-300 hover:border-white/40 hover:bg-white/10 focus-ring"
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
          <section className="mt-8 sm:mt-12" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="mb-4 text-lg font-bold tracking-tight text-[#F5F5F7] sm:mb-5 sm:text-xl">Pregled</h2>
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              <div className="rounded-[12px] border border-[#2A2A2F] bg-[#141417] p-4 sm:rounded-[14px] sm:p-6">
                <p className="text-2xl font-bold text-[#F5F5F7] sm:text-3xl">{reservations.length}</p>
                <p className="mt-0.5 text-[11px] text-[#A1A1A6] sm:mt-1 sm:text-sm">Zakazivanja</p>
              </div>
              <div className="rounded-[12px] border border-[#2A2A2F] bg-[#141417] p-4 sm:rounded-[14px] sm:p-6">
                <p className="text-2xl font-bold text-[#F5F5F7] sm:text-3xl">{barbers.length}</p>
                <p className="mt-0.5 text-[11px] text-[#A1A1A6] sm:mt-1 sm:text-sm">Berberi</p>
              </div>
              <div className="rounded-[12px] border border-[#2A2A2F] bg-[#141417] p-4 sm:rounded-[14px] sm:p-6">
                <p className="text-2xl font-bold text-[#F5F5F7] sm:text-3xl">{services.length}</p>
                <p className="mt-0.5 text-[11px] text-[#A1A1A6] sm:mt-1 sm:text-sm">Usluge</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Reservation details modal */}
      {selectedReservation && (
        <div className="admin-modal-overlay fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md p-0 sm:items-center sm:p-4"
          onClick={() => setSelectedReservation(null)} role="dialog" aria-modal="true" aria-labelledby="reservation-dialog-title">
          <div className="admin-modal-content w-full max-h-[90vh] overflow-y-auto rounded-t-[24px] border-t-2 border-white/10 bg-[#1a1a1a] p-6 shadow-2xl sm:max-w-lg sm:rounded-[24px] sm:border-2 sm:p-8"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-5 sm:mb-8 sm:pb-6">
              <div className="min-w-0 flex-1">
                <h3 id="reservation-dialog-title" className="font-heading text-[20px] text-white sm:text-[24px] md:text-[28px]">DETALJI REZERVACIJE</h3>
                <span className="mt-2 block h-[3px] w-12 bg-white/70 sm:w-16" />
                <p className="mt-3 text-[13px] text-white/60 sm:mt-4 sm:text-[14px]">{getLocalTimeString(selectedReservation.r.start_time)} – {getLocalTimeString(selectedReservation.r.end_time)}</p>
              </div>
              <button type="button" onClick={() => setSelectedReservation(null)}
                className="ml-4 shrink-0 rounded-full p-2 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white focus-ring" aria-label="Zatvori">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <dl className="space-y-5 sm:space-y-6">
              <div>
                <dt className="mb-1.5 font-heading text-[10px] uppercase tracking-widest text-white/70 sm:mb-2">Korisnik</dt>
                <dd className="text-[14px] font-medium text-white sm:text-[15px]">{selectedReservation.r.customer_name}</dd>
              </div>
              <div>
                <dt className="mb-1.5 font-heading text-[10px] uppercase tracking-widest text-white/70 sm:mb-2">Telefon</dt>
                <dd className="text-[14px] text-white sm:text-[15px]">
                  <a href={`tel:${selectedReservation.r.customer_phone}`} className="text-white/90 hover:text-white hover:underline transition-colors">{selectedReservation.r.customer_phone}</a>
                </dd>
              </div>
              {selectedReservation.r.customer_email && (
                <div>
                  <dt className="mb-1.5 font-heading text-[10px] uppercase tracking-widest text-white/70 sm:mb-2">Imejl</dt>
                  <dd className="text-[14px] text-white sm:text-[15px]">
                    <a href={`mailto:${selectedReservation.r.customer_email}`} className="text-white/90 hover:text-white hover:underline transition-colors break-all">{selectedReservation.r.customer_email}</a>
                  </dd>
                </div>
              )}
              <div className="flex flex-col gap-5 pt-2 border-t border-white/10 sm:flex-row sm:gap-8">
                <div>
                  <dt className="mb-1.5 font-heading text-[10px] uppercase tracking-widest text-white/70 sm:mb-2">Berber</dt>
                  <dd className="text-[14px] font-medium text-white sm:text-[15px]">{selectedReservation.barber?.name ?? "—"}</dd>
                </div>
                <div className="flex-1">
                  <dt className="mb-1.5 font-heading text-[10px] uppercase tracking-widest text-white/70 sm:mb-2">Usluge</dt>
                  <dd className="text-[14px] text-white sm:text-[15px]">
                    {selectedReservation.services.length > 0
                      ? selectedReservation.services.map((s) => s.service_name).join(", ")
                      : "—"}
                    {selectedReservation.services.length > 0 && (
                      <span className="mt-1 block font-bold text-white/90 sm:mt-0 sm:ml-2 sm:inline">({SLOT_DURATION} min · {selectedReservation.totalPriceRsd} RSD)</span>
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
