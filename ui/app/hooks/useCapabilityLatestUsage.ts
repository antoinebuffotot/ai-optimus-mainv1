import { useCallback, useEffect, useState } from "react";
import { queryExecutionClient } from "@dynatrace-sdk/client-query";
import { latestUsageQueries } from "../lib/usage-criteria";
import type { LatestUsageQuery } from "../lib/usage-criteria";

// Records are projected by each capability's DQL query — schema varies. The
// `timestamp` field is normalized to an ISO string when present so the UI can
// format it consistently; everything else is passed through as-is.
export type LatestUsageRecord = Record<string, unknown> & {
  timestamp?: string | null;
};

export type LatestUsageState = "loading" | "loaded" | "error";

export interface LatestUsageResult {
  capabilityId: string;
  records: LatestUsageRecord[];
  state: LatestUsageState;
  error: string | null;
}

const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 30_000;

const toIsoString = (raw: unknown): string | null => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return new Date(raw).toISOString();
  if (raw instanceof Date) return raw.toISOString();
  return String(raw);
};


const fetchLatestUsage = async (
  q: LatestUsageQuery
): Promise<LatestUsageResult> => {
  try {
    let response = await queryExecutionClient.queryExecute({
      body: { query: q.dql },
    });
    const startedAt = Date.now();
    while (
      response.state !== "SUCCEEDED" &&
      response.state !== "FAILED" &&
      response.state !== "CANCELLED" &&
      response.state !== "RESULT_GONE"
    ) {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        throw new Error("Query polling timed out");
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      if (!response.requestToken) {
        throw new Error("Missing requestToken while polling");
      }
      response = await queryExecutionClient.queryPoll({
        requestToken: response.requestToken,
      });
    }
    if (response.state !== "SUCCEEDED") {
      throw new Error(`Query ended in state ${response.state}`);
    }
    const rawRecords = response.result?.records ?? [];
    const records: LatestUsageRecord[] = rawRecords.map((r) => {
      const rec = (r ?? {}) as Record<string, unknown>;
      return {
        ...rec,
        timestamp: toIsoString(rec.timestamp),
      };
    });
    return {
      capabilityId: q.capabilityId,
      records,
      state: "loaded",
      error: null,
    };
  } catch (err) {
    return {
      capabilityId: q.capabilityId,
      records: [],
      state: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

const initialResults: LatestUsageResult[] = latestUsageQueries.map((q) => ({
  capabilityId: q.capabilityId,
  records: [],
  state: "loading",
  error: null,
}));

export interface LatestUsageAssessment {
  results: LatestUsageResult[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useCapabilityLatestUsage = (): LatestUsageAssessment => {
  const [results, setResults] = useState<LatestUsageResult[]>(initialResults);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setResults(initialResults);
    const evaluated = await Promise.all(latestUsageQueries.map(fetchLatestUsage));
    setResults(evaluated);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { results, isLoading, refresh };
};
