import { useCallback, useEffect, useMemo, useState } from "react";
import { queryExecutionClient } from "@dynatrace-sdk/client-query";
import { usageCapabilityIds, usageCriteria } from "../lib/usage-criteria";
import type { UsageCriterion } from "../lib/usage-criteria";

export type CriterionState = "met" | "unmet" | "unknown" | "loading";

export interface CriterionResult {
  id: string;
  capabilityId: string;
  label: string;
  state: CriterionState;
  count: number | null;
  error: string | null;
}

export interface UsageAssessment {
  results: CriterionResult[];
  score: number;
  evaluatedAt: number | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 30_000;

const evaluateCriterion = async (
  c: UsageCriterion
): Promise<CriterionResult> => {
  try {
    let response = await queryExecutionClient.queryExecute({
      body: { query: c.dql },
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
    const records = response.result?.records ?? [];
    const rawCount = records.length > 0 ? (records[0] as { c?: unknown }).c : 0;
    const count =
      typeof rawCount === "number"
        ? rawCount
        : typeof rawCount === "string" && rawCount !== ""
          ? Number(rawCount)
          : 0;
    return {
      id: c.id,
      capabilityId: c.capabilityId,
      label: c.label,
      state: records.length > 0 ? "met" : "unmet",
      count: Number.isFinite(count) ? count : 0,
      error: null,
    };
  } catch (err) {
    return {
      id: c.id,
      capabilityId: c.capabilityId,
      label: c.label,
      state: "unknown",
      count: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

const computeUsageScore = (results: CriterionResult[]): number => {
  const usedCount = usageCapabilityIds.filter((capId) => {
    const forCap = results.filter((r) => r.capabilityId === capId);
    if (forCap.length === 0) return false;
    return forCap.every((r) => r.state === "met");
  }).length;
  return Math.round((usedCount / usageCapabilityIds.length) * 100);
};

const initialResults: CriterionResult[] = usageCriteria.map((c) => ({
  id: c.id,
  capabilityId: c.capabilityId,
  label: c.label,
  state: "loading",
  count: null,
  error: null,
}));

export const useCapabilityUsage = (): UsageAssessment => {
  const [results, setResults] = useState<CriterionResult[]>(initialResults);
  const [evaluatedAt, setEvaluatedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setResults(initialResults);
    const evaluated = await Promise.all(usageCriteria.map(evaluateCriterion));
    setResults(evaluated);
    setEvaluatedAt(Date.now());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const score = useMemo(() => computeUsageScore(results), [results]);

  return { results, score, evaluatedAt, isLoading, refresh };
};
