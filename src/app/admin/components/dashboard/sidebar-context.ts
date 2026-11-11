"use client";
import { createContext } from "react";

const DashboardSidebarContext = createContext<{
  onPageItemClick: () => void;
  mini: boolean;
} | null>(null);

export default DashboardSidebarContext;
