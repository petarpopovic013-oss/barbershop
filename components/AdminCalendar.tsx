"use client";

import { useState, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const HOUR_START = 9;
const HOUR_END = 20;
const SLOT_MINUTES = 30;

type Barber = { id: number; name: string };
type Service = { id: number; service_name: string; duration_minutes: number; price_rsd: number };
type Reservation = {
  id: number;
  barber_id: number;
  service_id: number;
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

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
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

function pixelPerMinute(): number {
  return 2;
}

export function AdminCalendar({
  barbers,
  services,
  reservations,
  dateStr,
  barberFilter,
  fetchError,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedReservation, setSelectedReservation] = useState<{
    r: Reservation;
    service?: Service;
    barber?: Barber;
  } | null>(null);

  const date = new Date(dateStr + "T12:00:00");
  const dayLabel = date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const updateParams = (updates: { date?: string; barber?: string }) => {
    const p = new URLSearchParams(searchParams.toString());
    if (updates.date !== undefined) p.set("date", updates.date);
    if (updates.barber !== undefined) p.set("barber", updates.barber);
    router.push(`/admin?${p.toString()}`);
  };

  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    updateParams({ date: toDateStr(d) });
  };

  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    updateParams({ date: toDateStr(d) });
  };

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));
  const barberMap = Object.fromEntries(barbers.map((b) => [b.id, b]));

  const displayBarbers =
    barberFilter === "all" || !barberFilter
      ? barbers
      : barbers.filter((b) => String(b.id) === barberFilter);
  const columns = displayBarbers.length || 1;
  const slots = timeSlots();
  const dayStartMinutes = HOUR_START * 60;
  const totalMinutes = (HOUR_END - HOUR_START) * 60;
  const pxPerMin = pixelPerMinute();

  const getBlockStyle = (r: Reservation) => {
    const startDate = new Date(r.start_time);
    const endDate = new Date(r.end_time);
    const startM = startDate.getHours() * 60 + startDate.getMinutes() - dayStartMinutes;
    const durationM = (endDate.getTime() - startDate.getTime()) / 60000;
    return {
      top: `${startM * pxPerMin}px`,
      height: `${Math.max(durationM * pxPerMin, 24)}px`,
    };
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Admin
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-[var(--radius-btn)] border border-[var(--border-muted)] px-3 py-2 text-sm text-[var(--foreground-muted)] transition-default hover:border-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        >
          Log out
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevDay}
            className="rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-default focus-ring hover:border-[var(--accent)] hover:bg-white/5"
          >
            Prev day
          </button>
          <button
            type="button"
            onClick={nextDay}
            className="rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-default focus-ring hover:border-[var(--accent)] hover:bg-white/5"
          >
            Next day
          </button>
        </div>
        <label className="flex items-center gap-2">
          <span className="text-sm text-[var(--foreground-muted)]">Date</span>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => updateParams({ date: e.target.value })}
            className="rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm text-[var(--foreground-muted)]">Barber</span>
          <select
            value={barberFilter}
            onChange={(e) => updateParams({ barber: e.target.value })}
            className="rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          >
            <option value="all">All barbers</option>
            {barbers.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-[var(--foreground-muted)]">{dayLabel}</span>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-[var(--radius-card)] border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {fetchError}
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-muted)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
        <div className="border-b border-[var(--border-muted)] bg-[var(--surface-mid)] px-4 py-3">
          <h2 className="font-serif text-lg font-semibold text-[var(--foreground)]">
            Reservations — {dayLabel}
          </h2>
        </div>
        <div className="overflow-x-auto">
          {reservations.length === 0 && !fetchError ? (
            <div className="px-6 py-12 text-center text-sm text-[var(--foreground-muted)]">
              No reservations for this day.
            </div>
          ) : (
          <div
            className="grid min-w-[600px]"
            style={{ gridTemplateColumns: `80px repeat(${columns}, minmax(140px, 1fr))` }}
          >
            <div className="border-r border-b border-[var(--border-subtle)] p-2" />
            {displayBarbers.map((b) => (
              <div
                key={b.id}
                className="border-b border-r border-[var(--border-subtle)] px-2 py-3 text-center font-medium text-[var(--foreground)] last:border-r-0"
              >
                {b.name}
              </div>
            ))}
            {displayBarbers.length === 0 && (
              <div className="border-b border-r border-[var(--border-subtle)] px-2 py-3 text-center text-sm text-[var(--foreground-muted)]">
                —
              </div>
            )}
            {slots.map((slot) => (
              <Fragment key={slot}>
                <div className="border-r border-b border-[var(--border-subtle)] py-1 pr-2 text-right text-xs text-[var(--foreground-muted)]">
                  {slot}
                </div>
                {displayBarbers.length > 0
                  ? displayBarbers.map((barber) => {
                      const colReservations = reservations.filter(
                        (r) => r.barber_id === barber.id
                      );
                      return (
                        <div
                          key={`${slot}-${barber.id}`}
                          className="relative border-b border-r border-[var(--border-subtle)] last:border-r-0"
                          style={{ minHeight: `${SLOT_MINUTES * pxPerMin}px` }}
                        >
                          {colReservations
                            .filter((r) => {
                              const start = new Date(r.start_time);
                              const rs = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
                              return rs === slot;
                            })
                            .map((r) => {
                              const svc = serviceMap[r.service_id];
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedReservation({
                                      r,
                                      service: svc,
                                      barber,
                                    })
                                  }
                                  className="absolute left-1 right-1 rounded border border-[var(--accent)]/50 bg-[var(--accent)]/20 px-2 py-1 text-left text-xs transition-default focus-ring hover:bg-[var(--accent)]/30"
                                  style={getBlockStyle(r)}
                                >
                                  <span className="block truncate font-medium text-[var(--foreground)]">
                                    {r.customer_name || r.customer_phone || "—"}
                                  </span>
                                  <span className="block truncate text-[var(--foreground-muted)]">
                                    {svc?.service_name ?? "Service"}
                                  </span>
                                  <span className="block truncate text-[10px] text-[var(--foreground-muted)]">
                                    {formatTime(new Date(r.start_time))}–
                                    {formatTime(new Date(r.end_time))}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      );
                    })
                  : [
                      <div
                        key={`${slot}-empty`}
                        className="relative border-b border-r border-[var(--border-subtle)]"
                        style={{ minHeight: `${SLOT_MINUTES * pxPerMin}px` }}
                      />,
                    ]}
              </Fragment>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Statistics placeholder */}
      <section className="mt-12" aria-labelledby="stats-heading">
        <h2
          id="stats-heading"
          className="mb-6 font-serif text-xl font-semibold tracking-tight text-[var(--foreground)]"
        >
          Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 text-center"
            >
              <p className="text-sm text-[var(--foreground-muted)]">Coming soon</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reservation details modal */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedReservation(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-muted)] bg-[var(--surface-elevated)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[var(--foreground)]">
                Reservation details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="rounded-full p-1 text-[var(--foreground-muted)] transition-default hover:bg-white/10 hover:text-[var(--foreground)] focus-ring"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-[var(--foreground-muted)]">Customer</dt>
                <dd className="font-medium text-[var(--foreground)]">
                  {selectedReservation.r.customer_name}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-muted)]">Phone</dt>
                <dd className="text-[var(--foreground)]">
                  {selectedReservation.r.customer_phone}
                </dd>
              </div>
              {selectedReservation.r.customer_email && (
                <div>
                  <dt className="text-[var(--foreground-muted)]">Email</dt>
                  <dd className="text-[var(--foreground)]">
                    {selectedReservation.r.customer_email}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[var(--foreground-muted)]">Barber</dt>
                <dd className="text-[var(--foreground)]">
                  {selectedReservation.barber?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-muted)]">Service</dt>
                <dd className="text-[var(--foreground)]">
                  {selectedReservation.service?.service_name ?? "—"}
                  {selectedReservation.service && (
                    <span className="ml-1 text-[var(--foreground-muted)]">
                      ({selectedReservation.service.duration_minutes} min,{" "}
                      {selectedReservation.service.price_rsd} RSD)
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-muted)]">Time</dt>
                <dd className="text-[var(--foreground)]">
                  {formatTime(new Date(selectedReservation.r.start_time))} –
                  {formatTime(new Date(selectedReservation.r.end_time))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
