import React, { useMemo } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { Button } from "@dynatrace/strato-components/buttons";
import { Accordion } from "@dynatrace/strato-components/content";
import { SimpleTable } from "@dynatrace/strato-components/tables";
import type { SimpleTableColumnDef } from "@dynatrace/strato-components/tables";
import { PageHeader } from "../components/PageHeader";
import { useCapabilityUsage } from "../hooks/useCapabilityUsage";
import type { CriterionResult } from "../hooks/useCapabilityUsage";
import { useCapabilityLatestUsage } from "../hooks/useCapabilityLatestUsage";
import type { LatestUsageRecord } from "../hooks/useCapabilityLatestUsage";
import { getCapability } from "../lib/capability-registry";
import { usageCapabilityIds } from "../lib/usage-criteria";

const formatTimestamp = (ts: number | null): string =>
  ts === null ? "never" : new Date(ts).toLocaleString();

const formatRecordTimestamp = (raw: unknown): string => {
  if (raw === null || raw === undefined || raw === "") return "—";
  const d = new Date(raw as string);
  return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
};

const formatRecordValue = (raw: unknown): string => {
  if (raw === null || raw === undefined || raw === "") return "—";
  return typeof raw === "string" ? raw : String(raw);
};

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

const timestampColumn: SimpleTableColumnDef<LatestUsageRecord> = {
  id: "timestamp",
  header: "Time",
  accessor: (row) => formatRecordTimestamp(row.timestamp),
};

const userColumnHeaderByCapability: Record<string, string> = {
  "davis-assist": "user_email",
  "mcp-server": "user_email",
};

const columnsByCapability: Record<
  string,
  SimpleTableColumnDef<LatestUsageRecord>[]
> = {
  "ai-workflows": [
    timestampColumn,
    {
      id: "workflow-title",
      header: "dt.automation_engine.workflow.title",
      accessor: (row) =>
        formatRecordValue(row["dt.automation_engine.workflow.title"]),
    },
    {
      id: "task-name",
      header: "dt.automation_engine.task.name",
      accessor: (row) =>
        formatRecordValue(row["dt.automation_engine.task.name"]),
    },
  ],
  "ai-observability": [
    timestampColumn,
    {
      id: "service-name",
      header: "service.name",
      accessor: (row) => formatRecordValue(row["service.name"]),
    },
    {
      id: "k8s-deployment-name",
      header: "k8s.deployment.name",
      accessor: (row) => formatRecordValue(row["k8s.deployment.name"]),
    },
    {
      id: "k8s-container-name",
      header: "k8s.container.name",
      accessor: (row) => formatRecordValue(row["k8s.container.name"]),
    },
    {
      id: "gen-ai-response-model",
      header: "gen_ai.response.model",
      accessor: (row) => formatRecordValue(row["gen_ai.response.model"]),
    },
    {
      id: "gen-ai-provider-name",
      header: "gen_ai.provider.name",
      accessor: (row) => formatRecordValue(row["gen_ai.provider.name"]),
    },
  ],
};

const getLatestUsageColumns = (
  capabilityId: string
): SimpleTableColumnDef<LatestUsageRecord>[] =>
  columnsByCapability[capabilityId] ?? [
    timestampColumn,
    {
      id: "user",
      header: userColumnHeaderByCapability[capabilityId] ?? "Username",
      accessor: (row) => formatRecordValue(row.user),
    },
  ];

export const UsageAssessment = () => {
  const { results, score, evaluatedAt, isLoading, refresh } =
    useCapabilityUsage();
  const {
    results: latestUsageResults,
    isLoading: isLatestLoading,
    refresh: refreshLatest,
  } = useCapabilityLatestUsage();

  const latestUsageByCapability = useMemo(() => {
    const map = new Map<
      string,
      { records: LatestUsageRecord[]; state: string; error: string | null }
    >();
    for (const r of latestUsageResults) {
      map.set(r.capabilityId, {
        records: r.records,
        state: r.state,
        error: r.error,
      });
    }
    return map;
  }, [latestUsageResults]);

  const grouped = useMemo(
    () =>
      usageCapabilityIds.map((capId) => ({
        capability: getCapability(capId),
        capId,
        criteria: results.filter((r) => r.capabilityId === capId),
      })),
    [results]
  );

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshLatest()]);
  };

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="AI Capabilities Usage Assessment"
        description="Beyond activation status: this score reflects whether each capability is actually being exercised in your tenant, based on capability-specific usage signals."
        actions={
          <Button
            onClick={() => void handleRefresh()}
            loading={isLoading || isLatestLoading}
            variant="default"
          >
            Re-evaluate
          </Button>
        }
      />

      <Flex gap={32} alignItems="center">
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

      <Accordion multiple>
        {grouped.map(({ capId, capability, criteria }) => {
          const counts = criteria
            .map((c) => c.count)
            .filter((n): n is number => n !== null);
          const total = counts.reduce((acc, n) => acc + n, 0);
          const hasAnyCount = counts.length > 0;
          const latest = latestUsageByCapability.get(capId);
          const latestRecords = latest?.records ?? [];
          const label =
            (capability?.name ?? capId) +
            (hasAnyCount ? ` — ${total.toLocaleString()} events` : "");
          return (
            <Accordion.Section key={capId} id={capId}>
              <Accordion.SectionLabel>{label}</Accordion.SectionLabel>
              <Accordion.SectionContent>
                <Flex flexDirection="column" gap={12}>
                  {capability?.category && (
                    <Paragraph>{capability.category}</Paragraph>
                  )}
                  {criteria.map((c) => (
                    <Flex
                      key={c.id}
                      justifyContent="space-between"
                      gap={16}
                    >
                      <Paragraph>{c.label}</Paragraph>
                      <Paragraph>
                        <strong
                          style={
                            c.state === "met"
                              ? {
                                  color:
                                    "var(--dt-colors-text-success-default)",
                                }
                              : undefined
                          }
                        >
                          {stateLabel(c.state)}
                        </strong>
                        {c.error && (
                          <span title={c.error}>
                            {" "}
                            (query error — see tooltip)
                          </span>
                        )}
                      </Paragraph>
                    </Flex>
                  ))}

                  <Heading level={5}>Latest usage</Heading>
                  {latest?.state === "loading" ? (
                    <Paragraph>Loading latest usage…</Paragraph>
                  ) : latest?.state === "error" ? (
                    <Paragraph>
                      <span title={latest.error ?? undefined}>
                        Could not load latest usage (query error — hover for
                        details).
                      </span>
                    </Paragraph>
                  ) : latestRecords.length === 0 ? (
                    <Paragraph>
                      No usage events recorded in the last 30 days.
                    </Paragraph>
                  ) : (
                    <SimpleTable
                      data={latestRecords}
                      columns={getLatestUsageColumns(capId)}
                    />
                  )}
                </Flex>
              </Accordion.SectionContent>
            </Accordion.Section>
          );
        })}
      </Accordion>
    </Flex>
  );
};
