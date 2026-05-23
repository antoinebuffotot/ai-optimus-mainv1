import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAppState, useSetAppState } from "@dynatrace-sdk/react-hooks";
import { demoVerticals, getDemoVertical } from "../lib/demo-registry";

const SHARED_KEY = "ai-optimus.demo.urls.v1";
const SHARED_TTL = "now+90d";
const FALLBACK_KEY = "ai-optimus.demo.urls.v1";

interface SharedUrls {
  urls: Record<string, string>;
  updatedAt: number;
}

const emptyShared = (): SharedUrls => ({ urls: {}, updatedAt: 0 });

const parseShared = (raw: string | undefined): SharedUrls => {
  if (!raw) return emptyShared();
  try {
    const parsed = JSON.parse(raw) as Partial<SharedUrls>;
    if (parsed && typeof parsed === "object" && parsed.urls) {
      return {
        urls: parsed.urls,
        updatedAt: parsed.updatedAt ?? 0,
      };
    }
  } catch {
    // ignore
  }
  return emptyShared();
};

const readFallback = (): Record<string, string> => {
  try {
    const raw = window.localStorage.getItem(FALLBACK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { urls?: Record<string, string> };
    return parsed?.urls ?? {};
  } catch {
    return {};
  }
};

const writeFallback = (urls: Record<string, string>): void => {
  try {
    window.localStorage.setItem(
      FALLBACK_KEY,
      JSON.stringify({ urls, updatedAt: Date.now() })
    );
  } catch {
    // ignore
  }
};

const isMissingKeyError = (
  err: Error | undefined,
  details: { code?: number } | undefined
): boolean => {
  if (!err) return false;
  if (details?.code === 404) return true;
  return /unknown key|not found/i.test(err.message);
};

export interface DemoUrlEntry {
  id: string;
  name: string;
  defaultUrl: string;
  /** The effective URL: override if set, otherwise default. */
  effectiveUrl: string;
  /** True when an admin override is active. */
  hasOverride: boolean;
}

export interface DemoUrlsApi {
  /** All demos that have a URL (placeholder demos without a defaultUrl are excluded). */
  entries: DemoUrlEntry[];
  /** Look up the effective URL for a specific demo, or undefined if the demo has no URL. */
  getUrl: (id: string) => string | undefined;
  /** Persist a new URL override for a demo. */
  setUrl: (id: string, url: string) => Promise<void>;
  /** Remove the override and fall back to the default URL. */
  resetUrl: (id: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useDemoUrls = (): DemoUrlsApi => {
  const {
    data,
    refetch,
    isLoading,
    error: readError,
    errorDetails: readErrorDetails,
  } = useAppState({ key: SHARED_KEY });
  const { execute: setShared, error: writeError } = useSetAppState();

  const overrides = useMemo<Record<string, string>>(() => {
    const remote = parseShared(data?.value);
    const fallback = readFallback();
    return { ...fallback, ...remote.urls };
  }, [data]);

  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!isMissingKeyError(readError, readErrorDetails)) return;
    seededRef.current = true;
    void (async () => {
      try {
        await setShared({
          key: SHARED_KEY,
          body: {
            value: JSON.stringify(emptyShared()),
            validUntilTime: SHARED_TTL,
          },
        });
        try {
          await refetch();
        } catch {
          // ignore — the next read will see the new value
        }
      } catch {
        // ignore — write may be denied; localStorage fallback still works
      }
    })();
  }, [readError, readErrorDetails, refetch, setShared]);

  const entries = useMemo<DemoUrlEntry[]>(
    () =>
      demoVerticals
        .filter((v): v is typeof v & { defaultUrl: string } =>
          typeof v.defaultUrl === "string"
        )
        .map((v) => {
          const override = overrides[v.id];
          return {
            id: v.id,
            name: v.name,
            defaultUrl: v.defaultUrl,
            effectiveUrl: override ?? v.defaultUrl,
            hasOverride: typeof override === "string",
          };
        }),
    [overrides]
  );

  const getUrl = useCallback(
    (id: string): string | undefined => {
      const override = overrides[id];
      if (override) return override;
      return getDemoVertical(id)?.defaultUrl;
    },
    [overrides]
  );

  const persistRemote = useCallback(
    async (nextUrls: Record<string, string>) => {
      let fresh: SharedUrls = emptyShared();
      try {
        const r = await refetch();
        fresh = parseShared(r?.value);
      } catch {
        // first write returns 404; proceed with empty
      }
      const updated: SharedUrls = {
        urls: { ...fresh.urls, ...nextUrls },
        updatedAt: Date.now(),
      };
      // Drop keys that were explicitly removed (value === "")
      for (const [k, v] of Object.entries(nextUrls)) {
        if (v === "") delete updated.urls[k];
      }
      try {
        await setShared({
          key: SHARED_KEY,
          body: {
            value: JSON.stringify(updated),
            validUntilTime: SHARED_TTL,
          },
        });
        try {
          await refetch();
        } catch {
          // ignore
        }
      } catch {
        // localStorage fallback still keeps the change local
      }
      writeFallback(updated.urls);
    },
    [refetch, setShared]
  );

  const setUrl = useCallback(
    async (id: string, url: string) => {
      await persistRemote({ [id]: url });
    },
    [persistRemote]
  );

  const resetUrl = useCallback(
    async (id: string) => {
      // empty string is the sentinel for "remove override" in persistRemote
      await persistRemote({ [id]: "" });
    },
    [persistRemote]
  );

  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch {
      // surfaced via error
    }
  }, [refetch]);

  const effectiveReadError = isMissingKeyError(readError, readErrorDetails)
    ? null
    : readError ?? null;

  return {
    entries,
    getUrl,
    setUrl,
    resetUrl,
    isLoading,
    error: writeError ?? effectiveReadError,
    refresh,
  };
};
