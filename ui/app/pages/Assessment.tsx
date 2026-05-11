import React, { useEffect, useMemo } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { Button } from "@dynatrace/strato-components/buttons";
import { useAppState, useSetAppState } from "@dynatrace-sdk/react-hooks";
import { PageHeader } from "../components/PageHeader";
import { useCapabilityStatus } from "../hooks/useCapabilityStatus";
import { computeCoverageScore } from "../lib/capability-registry";

const SCORE_STATE_KEY = "ai-optimus.assessment-score";
const SCORE_STATE_TTL = "now+30d";

interface StoredScore {
  version: "1";
  score: number;
  fetchedAt: number;
}

const formatTimestamp = (ts: number | null): string =>
  ts === null ? "never" : new Date(ts).toLocaleString();

const parseStored = (raw: string | undefined): StoredScore | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredScore;
    return parsed.version === "1" ? parsed : null;
  } catch {
    return null;
  }
};

export const Assessment = () => {
  const { views, fetchedAt, isStale, isLoading, error, refresh } =
    useCapabilityStatus();
  const score = computeCoverageScore(views);
  const inactive = views.filter((v) => v.status === "inactive");

  const {
    data: storedData,
    refetch: refetchStored,
    error: storedError,
  } = useAppState({ key: SCORE_STATE_KEY });
  const stored = useMemo(
    () => parseStored(storedData?.value),
    [storedData]
  );

  const { execute: writeScore, error: writeError } = useSetAppState();

  useEffect(() => {
    if (fetchedAt === null) return;
    if (stored && stored.score === score && stored.fetchedAt === fetchedAt) {
      return;
    }
    const payload: StoredScore = { version: "1", score, fetchedAt };
    writeScore({
      key: SCORE_STATE_KEY,
      body: {
        value: JSON.stringify(payload),
        validUntilTime: SCORE_STATE_TTL,
      },
    })
      .then(() => refetchStored())
      .catch(() => {
        // surfaced via writeError below
      });
  }, [score, fetchedAt, stored, writeScore, refetchStored]);

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="AI Observability Usage Assessment"
        description="Real-time view of which AI Observability capabilities are active on your tenant, with prioritised recommendations to close coverage gaps."
        actions={
          <Button
            onClick={() => void refresh()}
            loading={isLoading}
            variant="default"
          >
            Refresh
          </Button>
        }
      />

      <Flex gap={32} alignItems="center">
        <Flex flexDirection="column">
          <Heading level={2}>{score}%</Heading>
          <Paragraph>Coverage score</Paragraph>
        </Flex>
        <Flex flexDirection="column">
          <Paragraph>
            Last synced: <strong>{formatTimestamp(fetchedAt)}</strong>
          </Paragraph>
          {stored && (
            <Paragraph>
              Previously stored: <strong>{stored.score}%</strong> on{" "}
              {formatTimestamp(stored.fetchedAt)}
            </Paragraph>
          )}
          {isStale && (
            <Paragraph>
              Data is older than 24 hours — refresh to update.
            </Paragraph>
          )}
          {error && <Paragraph>Sync error: {error.message}</Paragraph>}
          {(writeError || storedError) && (
            <Paragraph>
              Score persistence error:{" "}
              {(writeError ?? storedError)?.message ?? "unknown"}
            </Paragraph>
          )}
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={8}>
        <Heading level={3}>Capability inventory</Heading>
        {views.length === 0 ? (
          <Paragraph>No capability data available yet.</Paragraph>
        ) : (
          views.map((v) => (
            <Flex key={v.id} justifyContent="space-between" gap={16}>
              <Paragraph>
                <strong>{v.name}</strong> — {v.category}
              </Paragraph>
              <Paragraph>{v.status}</Paragraph>
            </Flex>
          ))
        )}
      </Flex>

      {inactive.length > 0 && (
        <Flex flexDirection="column" gap={8}>
          <Heading level={3}>Recommended next steps</Heading>
          {inactive.map((v) => (
            <Paragraph key={v.id}>
              Enable <strong>{v.name}</strong> — {v.description}
            </Paragraph>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
