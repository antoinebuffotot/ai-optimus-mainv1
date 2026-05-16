import React, { useMemo } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { Button } from "@dynatrace/strato-components/buttons";
import { PageHeader } from "../components/PageHeader";
import { useCapabilityUsage } from "../hooks/useCapabilityUsage";
import type { CriterionResult } from "../hooks/useCapabilityUsage";
import { getCapability } from "../lib/capability-registry";
import { usageCapabilityIds } from "../lib/usage-criteria";

const formatTimestamp = (ts: number | null): string =>
  ts === null ? "never" : new Date(ts).toLocaleString();

const stateLabel = (s: CriterionResult["state"]): string => {
  switch (s) {
    case "met":
      return "✓ in use";
    case "unmet":
      return "✗ not used";
    case "loading":
      return "…";
    default:
      return "? unknown";
  }
};

export const UsageAssessment = () => {
  const { results, score, evaluatedAt, isLoading, refresh } =
    useCapabilityUsage();

  const grouped = useMemo(
    () =>
      usageCapabilityIds.map((capId) => ({
        capability: getCapability(capId),
        capId,
        criteria: results.filter((r) => r.capabilityId === capId),
      })),
    [results]
  );

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="AI Capabilities Usage Assessment"
        description="Beyond activation status: this score reflects whether each capability is actually being exercised in your tenant, based on capability-specific usage signals."
        actions={
          <Button
            onClick={() => void refresh()}
            loading={isLoading}
            variant="default"
          >
            Re-evaluate
          </Button>
        }
      />

      <Flex gap={32} alignItems="center">
        <Flex flexDirection="column">
          <Heading level={2}>{score}%</Heading>
          <Paragraph>Usage score</Paragraph>
        </Flex>
        <Flex flexDirection="column">
          <Paragraph>
            Evaluated at: <strong>{formatTimestamp(evaluatedAt)}</strong>
          </Paragraph>
          <Paragraph>
            A capability counts as "in use" only when <em>all</em> of its
            criteria are met.
          </Paragraph>
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap={16}>
        {grouped.map(({ capId, capability, criteria }) => {
          const counts = criteria
            .map((c) => c.count)
            .filter((n): n is number => n !== null);
          const total = counts.reduce((acc, n) => acc + n, 0);
          const hasAnyCount = counts.length > 0;
          return (
          <Flex
            key={capId}
            flexDirection="column"
            gap={8}
            padding={16}
            style={{
              border: "1px solid var(--dt-colors-border-neutral-default)",
              borderRadius: "8px",
            }}
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              gap={8}
            >
              <Heading level={4}>{capability?.name ?? capId}</Heading>
              {hasAnyCount && (
                <Paragraph>
                  <strong>{total.toLocaleString()}</strong>{" "}
                  {total === 1 ? "event" : "events"}
                </Paragraph>
              )}
            </Flex>
            <Paragraph>{capability?.category}</Paragraph>
            {criteria.map((c) => (
              <Flex key={c.id} justifyContent="space-between" gap={16}>
                <Paragraph>{c.label}</Paragraph>
                <Paragraph>
                  <strong>{stateLabel(c.state)}</strong>
                  {c.error && (
                    <span title={c.error}> (query error — see tooltip)</span>
                  )}
                </Paragraph>
              </Flex>
            ))}
          </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
