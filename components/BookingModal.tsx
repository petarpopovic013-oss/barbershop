"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BARBERS = [
  {
    id: 1,
    name: "Marko",
    role: "Master Barber",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    name: "Stefan",
    role: "Senior Barber",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
  },
  {
    id: 3,
    name: "Nikola",
    role: "Barber",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
  },
];

function getNextFiveWeekdays(): { id: string; label: string; date: Date }[] {
  const days: { id: string; label: string; date: Date }[] = [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let d = new Date();
  let count = 0;
  while (count < 5) {
    d.setDate(d.getDate() + 1);
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      days.push({
        id: `${y}-${m}-${day}`,
        label: dayNames[dayOfWeek],
        date: new Date(d),
      });
      count++;
    }
  }
  return days;
}

function formatDayDate(d: Date): string {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

type Service = {
  id: number;
  service_name: string;
  price_rsd: number;
  duration_minutes: number;
  active: boolean;
};

type Step = 1 | 2 | 3 | 4 | 5;
type DayOption = { id: string; label: string; date: Date };
type ContactForm = { name: string; surname: string; mobile: string; email: string };

const initialContactForm: ContactForm = { name: "", surname: "", mobile: "", email: "" };

export function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedBarber, setSelectedBarber] = useState<(typeof BARBERS)[0] | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOption | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(initialContactForm);
  const [reveal, setReveal] = useState(false);
  
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);

  type ReservationSlot = { start_time: string; end_time: string };
  const [reservationsForDay, setReservationsForDay] = useState<ReservationSlot[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  
  const weekDays = useMemo(() => getNextFiveWeekdays(), [open]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const focusableSelector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getFocusableElements = useCallback(() => {
    const el = modalRef.current;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>(focusableSelector));
  }, []);

  const trapFocus = useCallback(() => {
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [getFocusableElements]);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const focusable = getFocusableElements();
    if (focusable.length > 0) (focusable[0] as HTMLElement).focus();
    const cleanup = trapFocus();
    return () => { cleanup?.(); previousActiveRef.current?.focus(); };
  }, [open, step, trapFocus, getFocusableElements]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => { document.removeEventListener("keydown", handleEscape); document.body.style.overflow = ""; };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setReveal(false);
      const t = requestAnimationFrame(() => { requestAnimationFrame(() => setReveal(true)); });
      return () => cancelAnimationFrame(t);
    } else { setReveal(false); }
  }, [open]);

  useEffect(() => { if (open && services.length === 0) fetchServices(); }, [open]);

  const fetchServices = async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Failed to load services");
      setServices(data.services || []);
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : "Failed to load services");
    } finally { setServicesLoading(false); }
  };

  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === overlayRef.current) onClose(); };

  const resetAndClose = () => {
    setStep(1); setSelectedBarber(null); setSelectedDay(null); setSelectedTime(null);
    setSelectedService(null); setContactForm(initialContactForm); setBookingError(null);
    setReservationId(null); onClose();
  };

  const handleConfirmBooking = async () => {
    if (!selectedBarber || !selectedDay || !selectedTime || !selectedService || !isContactValid) return;
    setBookingLoading(true); setBookingError(null);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startDateTime = new Date(selectedDay.date);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + selectedService.duration_minutes);
      const email = contactForm.email?.trim();
      const payload = {
        barberId: Number(selectedBarber.id), serviceId: Number(selectedService.id),
        customerName: `${contactForm.name.trim()} ${contactForm.surname.trim()}`.trim(),
        customerPhone: contactForm.mobile.trim(), ...(email ? { customerEmail: email } : {}),
        startTime: startDateTime.toISOString(), endTime: endDateTime.toISOString(),
      };
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const detail = data.errors?.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join("; ");
        throw new Error(detail || data.message || "Failed to create reservation");
      }
      setReservationId(data.reservationId); setStep(5);
    } catch (error) { setBookingError(error instanceof Error ? error.message : "Failed to create reservation"); }
    finally { setBookingLoading(false); }
  };

  const updateContact = (field: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isContactValid = contactForm.name.trim() !== "" && contactForm.surname.trim() !== "" &&
    contactForm.mobile.trim() !== "" && contactForm.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim());

  const handleDaySelect = (day: DayOption) => { setSelectedDay(day); setSelectedTime(null); setReservationsForDay([]); };

  useEffect(() => {
    if (!selectedBarber || !selectedDay || !open) { setReservationsForDay([]); return; }
    const startOfDay = new Date(selectedDay.date); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDay.date); endOfDay.setHours(23, 59, 59, 999);
    const dayStart = encodeURIComponent(startOfDay.toISOString());
    const dayEnd = encodeURIComponent(endOfDay.toISOString());
    let cancelled = false;
    setReservationsLoading(true);
    fetch(`/api/reservations?barberId=${selectedBarber.id}&dayStart=${dayStart}&dayEnd=${dayEnd}`)
      .then((res) => res.json())
      .then((data) => { if (cancelled || !data.ok) return; setReservationsForDay(data.reservations ?? []); })
      .catch(() => { if (!cancelled) setReservationsForDay([]); })
      .finally(() => { if (!cancelled) setReservationsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedBarber?.id, selectedDay?.id, open]);

  const isSlotDisabled = useCallback((time: string): boolean => {
    if (!selectedDay || reservationsForDay.length === 0) return false;
    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = new Date(selectedDay.date); slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart); slotEnd.setMinutes(slotEnd.getMinutes() + 30);
    const slotStartMs = slotStart.getTime(); const slotEndMs = slotEnd.getTime();
    return reservationsForDay.some((r) => {
      const resStart = new Date(r.start_time).getTime();
      const resEnd = new Date(r.end_time).getTime();
      return resStart < slotEndMs && resEnd > slotStartMs;
    });
  }, [selectedDay, reservationsForDay]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay-enter fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 ${reveal ? "modal-overlay-visible" : ""}`}
      onClick={handleOverlayClick}
      role="dialog" aria-modal="true" aria-labelledby="booking-modal-title"
    >
      <div
        ref={modalRef}
        className={`modal-content-enter flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[20px] bg-[#141417] border border-[#2A2A2F] shadow-2xl ${reveal ? "modal-content-visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2F] px-6 py-5">
          <h2 id="booking-modal-title" className="text-xl font-bold text-[#F5F5F7]">Book appointment</h2>
          <button type="button" onClick={resetAndClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#A1A1A6] transition-default focus-ring hover:bg-[#1A1A1F] hover:text-[#F5F5F7]"
            aria-label="Close">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step < 5 && (
            <div className="mb-6 flex gap-2">
              {([1, 2, 3, 4] as const).map((s) => (
                <span key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? "bg-[#FFA400]" : "bg-[#2A2A2F]"}`} aria-hidden />
              ))}
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="mb-5 text-lg font-semibold text-[#F5F5F7]">Choose your barber</h3>
              <ul className="grid gap-3 sm:grid-cols-3">
                {BARBERS.map((barber) => (
                  <li key={barber.id}>
                    <button type="button" onClick={() => setSelectedBarber(barber)}
                      className={`flex w-full flex-col items-center rounded-[14px] border-2 p-4 text-center transition-default focus-ring ${
                        selectedBarber?.id === barber.id ? "border-[#FFA400] bg-[#FFA400]/10" : "border-[#2A2A2F] hover:border-[#3A3A40]"
                      }`}>
                      <span className="block font-semibold text-[#F5F5F7]">{barber.name}</span>
                      <div className="relative my-3 h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#2A2A2F] bg-[#1A1A1F]">
                        <Image src={barber.image} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                      <span className="block text-sm text-[#A1A1A6]">{barber.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#F5F5F7]">Pick a day</h3>
              <p className="mb-4 text-sm text-[#A1A1A6]">Choose one of the next 5 weekdays</p>
              <ul className="mb-6 grid grid-cols-5 gap-2">
                {weekDays.map((day) => (
                  <li key={day.id} className="min-w-0">
                    <button type="button" onClick={() => handleDaySelect(day)}
                      className={`w-full min-w-0 rounded-lg border-2 px-2 py-3 text-center text-xs font-medium transition-default focus-ring sm:text-sm ${
                        selectedDay?.id === day.id ? "border-[#FFA400] bg-[#FFA400] text-[#0A0A0B]" : "border-[#2A2A2F] text-[#F5F5F7] hover:border-[#3A3A40]"
                      }`}>
                      <span className="block">{day.label}</span>
                      <span className="mt-1 block text-[10px] font-normal opacity-80 sm:text-xs">{formatDayDate(day.date)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {selectedDay && (
                <>
                  <h3 className="mb-4 text-lg font-semibold text-[#F5F5F7]">Pick a time</h3>
                  <p className="mb-4 text-sm text-[#A1A1A6]">
                    {reservationsLoading ? "Loading availability..." : `Available slots for ${selectedDay.label}, ${formatDayDate(selectedDay.date)}`}
                  </p>
                  <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {TIME_SLOTS.map((time) => {
                      const disabled = isSlotDisabled(time);
                      return (
                        <li key={time} className="min-w-0">
                          <button type="button" disabled={disabled} onClick={() => !disabled && setSelectedTime(time)}
                            title={disabled ? "This slot is already booked" : undefined}
                            className={`flex min-h-[44px] w-full min-w-0 items-center justify-center rounded-lg border-2 py-2.5 text-sm font-medium transition-default focus-ring ${
                              disabled ? "cursor-not-allowed border-[#2A2A2F] bg-[#1A1A1F] text-[#6B6B70] line-through"
                                : selectedTime === time ? "border-[#FFA400] bg-[#FFA400] text-[#0A0A0B]"
                                : "border-[#2A2A2F] text-[#F5F5F7] hover:border-[#3A3A40]"
                            }`}>
                            {time}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="mb-5 text-lg font-semibold text-[#F5F5F7]">Select service</h3>
              {servicesLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFA400] border-t-transparent"></div>
                  <span className="ml-3 text-sm text-[#A1A1A6]">Loading services...</span>
                </div>
              )}
              {servicesError && (
                <div className="rounded-[14px] bg-red-500/10 border border-red-500/30 p-4">
                  <p className="text-sm text-red-400 mb-3">{servicesError}</p>
                  <button type="button" onClick={fetchServices}
                    className="min-h-[44px] rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-default hover:bg-red-600">
                    Retry
                  </button>
                </div>
              )}
              {!servicesLoading && !servicesError && services.length === 0 && (
                <p className="py-8 text-center text-sm text-[#A1A1A6]">No services available at the moment.</p>
              )}
              {!servicesLoading && !servicesError && services.length > 0 && (
                <ul className="space-y-3">
                  {services.map((service) => (
                    <li key={service.id}>
                      <button type="button" onClick={() => setSelectedService(service)}
                        className={`flex w-full items-center justify-between rounded-[14px] border-2 p-4 text-left transition-default focus-ring ${
                          selectedService?.id === service.id ? "border-[#FFA400] bg-[#FFA400]/10" : "border-[#2A2A2F] hover:border-[#3A3A40]"
                        }`}>
                        <span>
                          <span className="block font-medium text-[#F5F5F7]">{service.service_name}</span>
                          <span className="text-sm text-[#A1A1A6]">{service.duration_minutes} min</span>
                        </span>
                        <span className="font-bold text-[#FFA400]">{service.price_rsd} RSD</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="mb-5 text-lg font-semibold text-[#F5F5F7]">Confirm booking</h3>
              <div className="rounded-[14px] bg-[#1A1A1F] border border-[#2A2A2F] p-5">
                <p className="text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">Barber:</strong> {selectedBarber?.name}</p>
                <p className="mt-2 text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">Day:</strong> {selectedDay ? `${selectedDay.label}, ${formatDayDate(selectedDay.date)}` : ""}</p>
                <p className="mt-2 text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">Time:</strong> {selectedTime}</p>
                <p className="mt-2 text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">Service:</strong> {selectedService?.service_name} — {selectedService?.price_rsd} RSD</p>
                <p className="mt-4 text-xl font-bold text-[#FFA400]">Total: {selectedService?.price_rsd ?? 0} RSD</p>
              </div>
              <h4 className="mt-6 mb-4 font-medium text-[#F5F5F7]">Your details</h4>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                <label className="sm:col-span-1">
                  <span className="mb-1.5 block text-sm font-medium text-[#A1A1A6]">Name</span>
                  <input type="text" value={contactForm.name} onChange={updateContact("name")} placeholder="Your first name"
                    className="w-full min-h-[44px] rounded-lg border border-[#2A2A2F] bg-[#0A0A0B] px-4 py-3 text-sm text-[#F5F5F7] placeholder:text-[#6B6B70] transition-default focus:border-[#FFA400] focus:outline-none focus:ring-2 focus:ring-[#FFA400]/25"
                    autoComplete="given-name" />
                </label>
                <label className="sm:col-span-1">
                  <span className="mb-1.5 block text-sm font-medium text-[#A1A1A6]">Surname</span>
                  <input type="text" value={contactForm.surname} onChange={updateContact("surname")} placeholder="Your surname"
                    className="w-full min-h-[44px] rounded-lg border border-[#2A2A2F] bg-[#0A0A0B] px-4 py-3 text-sm text-[#F5F5F7] placeholder:text-[#6B6B70] transition-default focus:border-[#FFA400] focus:outline-none focus:ring-2 focus:ring-[#FFA400]/25"
                    autoComplete="family-name" />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-[#A1A1A6]">Mobile number</span>
                  <input type="tel" value={contactForm.mobile} onChange={updateContact("mobile")} placeholder="e.g. +381 60 123 4567"
                    className="w-full min-h-[44px] rounded-lg border border-[#2A2A2F] bg-[#0A0A0B] px-4 py-3 text-sm text-[#F5F5F7] placeholder:text-[#6B6B70] transition-default focus:border-[#FFA400] focus:outline-none focus:ring-2 focus:ring-[#FFA400]/25"
                    autoComplete="tel" />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-[#A1A1A6]">Email</span>
                  <input type="email" value={contactForm.email} onChange={updateContact("email")} placeholder="your@email.com"
                    className="w-full min-h-[44px] rounded-lg border border-[#2A2A2F] bg-[#0A0A0B] px-4 py-3 text-sm text-[#F5F5F7] placeholder:text-[#6B6B70] transition-default focus:border-[#FFA400] focus:outline-none focus:ring-2 focus:ring-[#FFA400]/25"
                    autoComplete="email" />
                </label>
              </form>
              {bookingError && (
                <div className="mt-4 rounded-[14px] bg-red-500/10 border border-red-500/30 p-4">
                  <p className="text-sm text-red-400">{bookingError}</p>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#F5F5F7]">Booking Confirmed!</h3>
              <p className="mb-6 text-base text-[#A1A1A6]">Your reservation has been successfully created.</p>
              <div className="mx-auto max-w-sm rounded-[14px] bg-[#1A1A1F] border border-[#2A2A2F] p-5 text-left">
                <p className="text-xs text-[#6B6B70] mb-3"><strong>Reservation ID:</strong> {reservationId}</p>
                <p className="text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">Barber:</strong> {selectedBarber?.name}</p>
                <p className="mt-2 text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">When:</strong> {selectedDay ? `${selectedDay.label}, ${formatDayDate(selectedDay.date)} at ${selectedTime}` : ""}</p>
                <p className="mt-2 text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">Service:</strong> {selectedService?.service_name}</p>
                <p className="mt-2 text-sm text-[#A1A1A6]"><strong className="text-[#F5F5F7]">Total:</strong> {selectedService?.price_rsd} RSD</p>
              </div>
              <p className="mt-6 text-sm text-[#A1A1A6]">We&apos;ll send you a confirmation email shortly.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 border-t border-[#2A2A2F] px-6 py-5">
          {step > 1 && step < 5 ? (
            <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} disabled={bookingLoading}
              className="min-h-[48px] rounded-lg border-2 border-[#2A2A2F] px-6 py-3 text-sm font-semibold text-[#F5F5F7] transition-default focus-ring hover:border-[#3A3A40] hover:bg-[#1A1A1F]">
              Back
            </button>
          ) : <span />}
          {step < 4 ? (
            <button type="button"
              onClick={() => { if ((step === 1 && selectedBarber) || (step === 2 && selectedDay && selectedTime) || (step === 3 && selectedService)) setStep((s) => (s + 1) as Step); }}
              disabled={(step === 1 && !selectedBarber) || (step === 2 && (!selectedDay || !selectedTime)) || (step === 3 && !selectedService)}
              className="min-h-[48px] rounded-lg bg-[#FFA400] px-6 py-3 text-sm font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#FFB833] disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          ) : step === 4 ? (
            <button type="button" onClick={handleConfirmBooking} disabled={!isContactValid || bookingLoading}
              className="min-h-[48px] rounded-lg bg-[#FFA400] px-6 py-3 text-sm font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#FFB833] disabled:opacity-50 disabled:cursor-not-allowed">
              {bookingLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A0A0B] border-t-transparent"></span>
                  Booking...
                </span>
              ) : "Confirm Booking"}
            </button>
          ) : (
            <button type="button" onClick={resetAndClose}
              className="min-h-[48px] rounded-lg bg-[#FFA400] px-6 py-3 text-sm font-semibold text-[#0A0A0B] transition-default focus-ring hover:bg-[#FFB833]">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
