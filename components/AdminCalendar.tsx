"use client";

import { useState, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminDatePicker } from "@/components/AdminDatePicker";

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
  return 2.2;
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

  const displayBarbers =
    barberFilter === "all" || !barberFilter
      ? barbers
      : barbers.filter((b) => String(b.id) === barberFilter);
  const columns = displayBarbers.length || 1;
  const slots = timeSlots();
  const dayStartMinutes = HOUR_START * 60;
  const pxPerMin = pixelPerMinute();

  const getBlockStyle = (r: Reservation) => {
    const startDate = new Date(r.start_time);
    const endDate = new Date(r.end_time);
    const startM =
      startDate.getHours() * 60 + startDate.getMinutes() - dayStartMinutes;
    const durationM = (endDate.getTime() - startDate.getTime()) / 60000;
    return {
      top: `${startM * pxPerMin}px`,
      height: `${Math.max(durationM * pxPerMin, 28)}px`,
    };
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const datesWithReservations = new Set(
    reservations.length > 0 ? [dateStr] : []
  );

  return (
    <div className="admin-dashboard mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Manage reservations and schedule
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="admin-btn-secondary flex items-center gap-2 rounded-xl border border-[var(--border-muted)] px-4 py-2.5 text-sm font-medium text-[var(--foreground-muted)] transition-all hover:border-[var(--foreground-muted)]/50 hover:bg-white/5 hover:text-[var(--foreground)] focus-ring"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar – calendar + filters */}
        <aside className="shrink-0 lg:w-72">
          <div className="sticky top-6 space-y-4">
            <AdminDatePicker
              value={dateStr}
              onChange={(d) => updateParams({ date: d })}
              datesWithReservations={datesWithReservations}
            />

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
              <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
                Filter by barber
              </label>
              <select
                value={barberFilter}
                onChange={(e) => updateParams({ barber: e.target.value })}
                className="admin-select w-full rounded-lg border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2.5 text-sm text-[var(--foreground)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
              >
                <option value="all">All barbers</option>
                {barbers.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Day quick nav */}
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-2">
              <button
                type="button"
                onClick={prevDay}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-white/5 hover:text-[var(--foreground)] focus-ring"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Prev
              </button>
              <button
                type="button"
                onClick={nextDay}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-white/5 hover:text-[var(--foreground)] focus-ring"
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main – schedule */}
        <main className="min-w-0 flex-1">
          {fetchError && (
            <div className="admin-alert mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {fetchError}
            </div>
          )}

          <div className="admin-schedule-card overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-mid)] px-5 py-4">
              <h2 className="font-serif text-lg font-semibold tracking-tight text-[var(--foreground)]">
                Schedule — {dayLabel}
              </h2>
              <span className="rounded-full bg-[var(--surface-beige)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                {reservations.length} appointment
                {reservations.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              {reservations.length === 0 && !fetchError ? (
                <div className="admin-empty-state flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-beige)] text-[var(--foreground-muted)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    No reservations for this day
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    Select another date or check back later
                  </p>
                </div>
              ) : (
                <div
                  className="admin-schedule-grid grid min-w-[580px]"
                  style={{
                    gridTemplateColumns: `72px repeat(${columns}, minmax(150px, 1fr))`,
                  }}
                >
                  <div className="border-r border-b border-[var(--border-subtle)] bg-[var(--surface-mid)]/50 p-2" />
                  {displayBarbers.map((b) => (
                    <div
                      key={b.id}
                      className="border-b border-r border-[var(--border-subtle)] bg-[var(--surface-mid)]/50 px-3 py-4 text-center text-sm font-semibold text-[var(--foreground)]"
                    >
                      {b.name}
                    </div>
                  ))}
                  {displayBarbers.length === 0 && (
                    <div className="border-b border-r border-[var(--border-subtle)] px-3 py-4 text-center text-sm text-[var(--foreground-muted)]">
                      —
                    </div>
                  )}
                  {slots.map((slot) => (
                    <Fragment key={slot}>
                      <div className="border-r border-b border-[var(--border-subtle)] py-1.5 pr-2 text-right text-xs font-medium text-[var(--foreground-muted)]">
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
                                style={{
                                  minHeight: `${SLOT_MINUTES * pxPerMin}px`,
                                }}
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
                                        className="admin-reservation-block absolute left-1.5 right-1.5 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-2.5 py-1.5 text-left text-xs transition-all hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/25 focus-ring"
                                        style={getBlockStyle(r)}
                                      >
                                        <span className="block truncate font-semibold text-[var(--foreground)]">
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
                              style={{
                                minHeight: `${SLOT_MINUTES * pxPerMin}px`,
                              }}
                            />,
                          ]}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <section
            className="mt-10"
            aria-labelledby="stats-heading"
          >
            <h2
              id="stats-heading"
              className="mb-4 font-serif text-lg font-semibold tracking-tight text-[var(--foreground)]"
            >
              Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
                <p className="text-2xl font-semibold text-[var(--foreground)]">
                  {reservations.length}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Today&apos;s appointments
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
                <p className="text-2xl font-semibold text-[var(--foreground)]">
                  {barbers.length}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Active barbers
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
                <p className="text-2xl font-semibold text-[var(--foreground)]">
                  {services.length}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  Services offered
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Reservation details modal */}
      {selectedReservation && (
        <div
          className="admin-modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedReservation(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-dialog-title"
        >
          <div
            className="admin-modal-content w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3
                  id="reservation-dialog-title"
                  className="font-serif text-lg font-semibold text-[var(--foreground)]"
                >
                  Reservation details
                </h3>
                <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
                  {formatTime(new Date(selectedReservation.r.start_time))} –{" "}
                  {formatTime(new Date(selectedReservation.r.end_time))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="rounded-lg p-2 text-[var(--foreground-muted)] transition-colors hover:bg-white/10 hover:text-[var(--foreground)] focus-ring"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
                  Customer
                </dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]">
                  {selectedReservation.r.customer_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
                  Phone
                </dt>
                <dd className="mt-1 text-[var(--foreground)]">
                  <a
                    href={`tel:${selectedReservation.r.customer_phone}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    {selectedReservation.r.customer_phone}
                  </a>
                </dd>
              </div>
              {selectedReservation.r.customer_email && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
                    Email
                  </dt>
                  <dd className="mt-1 text-[var(--foreground)]">
                    <a
                      href={`mailto:${selectedReservation.r.customer_email}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {selectedReservation.r.customer_email}
                    </a>
                  </dd>
                </div>
              )}
              <div className="flex gap-6">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
                    Barber
                  </dt>
                  <dd className="mt-1 text-[var(--foreground)]">
                    {selectedReservation.barber?.name ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
                    Service
                  </dt>
                  <dd className="mt-1 text-[var(--foreground)]">
                    {selectedReservation.service?.service_name ?? "—"}
                    {selectedReservation.service && (
                      <span className="ml-1 text-[var(--foreground-muted)]">
                        ({selectedReservation.service.duration_minutes} min ·{" "}
                        {selectedReservation.service.price_rsd} RSD)
                      </span>
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
