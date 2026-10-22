"use client";
import { CeppContext } from "@/providers/cepp-provider";
import { useContext } from "react";
export function useCepp() {
  const value = useContext(CeppContext);
  if (!value) throw new Error("CeppProvider required");
  return value;
}
