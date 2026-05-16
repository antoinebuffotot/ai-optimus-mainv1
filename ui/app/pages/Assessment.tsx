import React, { useEffect, useMemo } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { Button } from "@dynatrace/strato-components/buttons";
import { Accordion } from "@dynatrace/strato-components/content";
import { SimpleTable } from "@dynatrace/strato-components/tables";
import type { SimpleTableColumnDef } from "@dynatrace/strato-components/tables";
import type { UserSummary } from "../hooks/useLearningActivity";
import { useAppState, useSetAppState } from "@dynatrace-sdk/react-hooks";
import { PageHeader } from "../components/PageHeader";
import { useCapabilityStatus } from "../hooks/useCapabilityStatus";
import {
  computeCoverageScore,
  getCapability,
} from "../lib/capability-registry";
import { useAllLearningActivity } from "../hooks/useLearningActivity";
import { learningContent } from "../lib/learning-content";

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

const userColumns: SimpleTableColumnDef<UserSummary>[] = [
  {
    id: "userEmail",
    header: "Username",
    accessor: "userEmail",
  },
  {
    id: "startedSubjects",
    header: "Started subjects",
    accessor: "startedSubjects",
    alignment: "right",
  },
  {
    id: "completedSubjects",
    header: "Completed subjects",
    accessor: "completedSubjects",
    alignment: "right",
  },
];

export const Assessment = () => {
  const { views, fetchedAt, isStale, isLoading, error, refresh } =
    useCapabilityStatus();
  const score = computeCoverageScore(views);
  const inactive = views.filter((v) => v.status === "inactive");
  const { stats: learningStats, refresh: refreshLearningStats } =
    useAllLearningActivity();

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
            onClick={() => {
              void refresh();
              void refreshLearningStats();
            }}
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

      <Flex flexDirection="column" gap={12}>
        <Heading level={3}>Learning activity</Heading>
        <Paragraph>
          Tracked across {learningStats.totalUsers} user
          {learningStats.totalUsers === 1 ? "" : "s"}, persisted in shared app
          state.
        </Paragraph>
        <Flex gap={24} flexWrap="wrap">
          <Flex
            flexDirection="column"
            alignItems="center"
            padding={16}
            style={{
              minWidth: 180,
              borderRadius: 8,
              background: "rgba(0,0,0,0.04)",
            }}
          >
            <Heading level={2}>{learningStats.startedCount}</Heading>
            <Paragraph>Users started Learning</Paragraph>
          </Flex>
          <Flex
            flexDirection="column"
            alignItems="center"
            padding={16}
            style={{
              minWidth: 180,
              borderRadius: 8,
              background: "rgba(0,0,0,0.04)",
            }}
          >
            <Heading level={2}>{learningStats.completedCount}</Heading>
            <Paragraph>Users completed Learning</Paragraph>
          </Flex>
          <Flex
            flexDirection="column"
            alignItems="center"
            padding={16}
            style={{
              minWidth: 180,
              borderRadius: 8,
              background: "rgba(0,0,0,0.04)",
            }}
          >
            <Heading level={2}>{learningStats.startedSubjectsCount}</Heading>
            <Paragraph>Subjects started (all users)</Paragraph>
          </Flex>
          <Flex
            flexDirection="column"
            alignItems="center"
            padding={16}
            style={{
              minWidth: 180,
              borderRadius: 8,
              background: "rgba(0,0,0,0.04)",
            }}
          >
            <Heading level={2}>{learningStats.completionPercent}%</Heading>
            <Paragraph>Completion (all users)</Paragraph>
          </Flex>
        </Flex>

        <Heading level={4}>Users who started Learning</Heading>
        {learningStats.perUser.length === 0 ? (
          <Paragraph>No users have started Learning yet.</Paragraph>
        ) : (
          <SimpleTable data={learningStats.perUser} columns={userColumns} />
        )}

        <Heading level={4}>Per subject</Heading>
        <Accordion multiple>
          {learningContent.map((c) => {
            const cap = getCapability(c.capabilityId);
            const subjectStats = learningStats.perSubject[c.capabilityId];
            const started = subjectStats?.startedCount ?? 0;
            const completed = subjectStats?.completedCount ?? 0;
            return (
              <Accordion.Section key={c.capabilityId} id={c.capabilityId}>
                <Accordion.SectionLabel>
                  {`${cap?.name ?? c.capabilityId} — ${started} started · ${completed} completed`}
                </Accordion.SectionLabel>
                <Accordion.SectionContent>
                  <Flex flexDirection="column" gap={12}>
                    {cap?.description && (
                      <Paragraph>{cap.description}</Paragraph>
                    )}
                    <Flex gap={32} flexWrap="wrap">
                      <Flex
                        flexDirection="column"
                        alignItems="center"
                        padding={12}
                        style={{
                          minWidth: 140,
                          borderRadius: 8,
                          background: "rgba(0,0,0,0.04)",
                        }}
                      >
                        <Heading level={3}>{started}</Heading>
                        <Paragraph>Users started</Paragraph>
                      </Flex>
                      <Flex
                        flexDirection="column"
                        alignItems="center"
                        padding={12}
                        style={{
                          minWidth: 140,
                          borderRadius: 8,
                          background: "rgba(0,0,0,0.04)",
                        }}
                      >
                        <Heading level={3}>{completed}</Heading>
                        <Paragraph>Users completed</Paragraph>
                      </Flex>
                    </Flex>
                    {subjectStats?.users.length ? (
                      <SimpleTable
                        data={subjectStats.users}
                        columns={userColumns}
                      />
                    ) : (
                      <Paragraph>
                        No users have started this subject yet.
                      </Paragraph>
                    )}
                  </Flex>
                </Accordion.SectionContent>
              </Accordion.Section>
            );
          })}
        </Accordion>
      </Flex>
    </Flex>
  );
};
