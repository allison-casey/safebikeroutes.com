'use client';
import { SessionProvider } from "next-auth/react";
import { MapProvider } from "react-map-gl";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
