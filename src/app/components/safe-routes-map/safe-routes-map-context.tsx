"use client";

import { createContext, useContext } from "react";

interface ISafeRoutesMapContext {
  region: string;
  regionLabel: string;
}

export const SafeRoutesMapContext = createContext<ISafeRoutesMapContext | null>(
  null,
);

export const useSafeRoutesMapContext = () => {
  const ctx = useContext(SafeRoutesMapContext);
  if (!ctx) {
    throw Error("Did not provide SafeRoutesMapContext.");
  }
  return ctx;
};
