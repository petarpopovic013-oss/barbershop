"use client";

import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <>
      {children}
      <Footer onBookClick={() => router.push("/")} />
    </>
  );
}
