'use client';
import { SessionProvider } from "next-auth/react";
import { MapProvider } from "react-map-gl";
import { DrawProvider } from "./components/safe-routes-map/use-draw";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MapProvider>
        <DrawProvider>
          {children}
        </DrawProvider>
      </MapProvider>
    </SessionProvider>
  );
}
