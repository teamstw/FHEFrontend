"use client";
import { backendEnabled } from "@/lib/api/backend-api";
import { useCallback, useEffect, useState } from "react";
export function useApiData<T>(load: () => Promise<T>, mock: T) {
  const [data, setData] = useState<T>(mock),
    [loading, setLoading] = useState(backendEnabled),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!backendEnabled) return;
    setLoading(true);
    setError("");
    try {
      setData(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [load]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return {
    data: backendEnabled && (error || loading) ? null : data,
    setData,
    loading,
    error,
    refresh,
  };
}
