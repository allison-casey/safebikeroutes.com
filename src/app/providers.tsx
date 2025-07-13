"use client";
import { SessionProvider } from "next-auth/react";
import { MapProvider } from "react-map-gl/mapbox";
import { DrawProvider } from "./components/mapbox/use-draw";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MapProvider>
        <DrawProvider>{children}</DrawProvider>
      </MapProvider>
    </SessionProvider>
  );
}
