import { useCallback, useEffect, useMemo, useState } from "react";
import { mergeStatus } from "../lib/capability-registry";
import type {
  CapabilityStatus,
  CapabilityStatusSnapshot,
  CapabilityView,
} from "../types/capability";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const STALE_LIMIT_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = "ai-optimus.capability-status.v1";

type Result = {
  views: CapabilityView[];
  fetchedAt: number | null;
  isStale: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setStatus: (id: string, status: CapabilityStatus) => void;
};

const readCache = (): CapabilityStatusSnapshot | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CapabilityStatusSnapshot;
  } catch {
    return null;
  }
};

const writeCache = (snapshot: CapabilityStatusSnapshot): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // quota or disabled storage — swallow per ADR-0001 fallback strategy
  }
};

const fetchCapabilityStatus = (): Promise<CapabilityStatusSnapshot> =>
  // TODO(UC1/UC2): replace with Settings v2 + Environment API call.
  Promise.resolve({ fetchedAt: Date.now(), entries: [] });

export const useCapabilityStatus = (): Result => {
  const [snapshot, setSnapshot] = useState<CapabilityStatusSnapshot | null>(
    () => readCache()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchCapabilityStatus();
      setSnapshot(next);
      writeCache(next);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setStatus = useCallback(
    (id: string, status: CapabilityStatus) => {
      setSnapshot((prev) => {
        const base = prev ?? { fetchedAt: Date.now(), entries: [] };
        const others = base.entries.filter((e) => e.id !== id);
        const next: CapabilityStatusSnapshot = {
          fetchedAt: base.fetchedAt,
          entries: [...others, { id, status }],
        };
        writeCache(next);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    const cached = readCache();
    const fresh =
      cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;
    if (!fresh) void refresh();
  }, [refresh]);

  const views = useMemo(
    () => mergeStatus(snapshot?.entries),
    [snapshot]
  );

  const fetchedAt = snapshot?.fetchedAt ?? null;
  const isStale =
    fetchedAt !== null && Date.now() - fetchedAt > CACHE_TTL_MS;
  const isExpired =
    fetchedAt !== null && Date.now() - fetchedAt > STALE_LIMIT_MS;

  return {
    views,
    fetchedAt,
    isStale,
    isLoading,
    error: isExpired
      ? new Error("Capability status cache exceeded 7-day grace period")
      : error,
    refresh,
    setStatus,
  };
};
