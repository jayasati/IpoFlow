import { useEffect, useState } from "react";
import { ApiError } from "../api/client";

interface UseAsyncDataResult<T> {
  data: T | null;
  setData: (updater: T | null | ((prev: T | null) => T | null)) => void;
  loading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  refetch: () => void;
}

/**
 * Fetches `fetcher()` whenever `deps` change, and exposes a manual `refetch`
 * for use after mutations (create/update/delete) without re-running deps logic.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  errorMessage = "Failed to load data.",
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    fetcher()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : errorMessage))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : errorMessage);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error, setError, refetch };
}
