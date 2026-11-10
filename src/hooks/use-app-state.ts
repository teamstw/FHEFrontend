"use client";
import { AppStateContext } from "@/providers/app-state-provider";
import { useContext } from "react";
export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used within AppStateProvider");
  return value;
}
