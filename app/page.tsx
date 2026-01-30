"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Barbers } from "@/components/Barbers";
import { Prices } from "@/components/Prices";
import { Location } from "@/components/Location";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
    //dawdawdawdawdaw
      <Header onBookClick={() => setBookingOpen(true)} />
      <main id="main-content">
        <Hero onBookClick={() => setBookingOpen(true)} />
        <ScrollReveal>
          <Barbers />
        </ScrollReveal>
        <ScrollReveal>
          <Prices onBookClick={() => setBookingOpen(true)} />
        </ScrollReveal>
        <ScrollReveal>
          <Location />
        </ScrollReveal>
        <ScrollReveal>
          <Gallery />
        </ScrollReveal>
        <Footer onBookClick={() => setBookingOpen(true)} />
      </main>
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
