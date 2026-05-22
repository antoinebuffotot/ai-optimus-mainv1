import React, { useMemo } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";
import { useCapabilityStatus } from "../hooks/useCapabilityStatus";
import { useCapabilityUsage } from "../hooks/useCapabilityUsage";

export const Capabilities = () => {
  const { views, fetchedAt, isStale, setStatus } = useCapabilityStatus();
  const { results: usageResults } = useCapabilityUsage();

  const usageByCapability = useMemo(() => {
    const map = new Map<
      string,
      { met: number; total: number; utilizationCount: number; hasCount: boolean }
    >();
    for (const r of usageResults) {
      const entry =
        map.get(r.capabilityId) ?? {
          met: 0,
          total: 0,
          utilizationCount: 0,
          hasCount: false,
        };
      entry.total += 1;
      if (r.state === "met") entry.met += 1;
      if (typeof r.count === "number") {
        entry.utilizationCount += r.count;
        entry.hasCount = true;
      }
      map.set(r.capabilityId, entry);
    }
    return map;
  }, [usageResults]);

  const activeCount = views.filter(
    (v) => v.status === "active" || v.status === "partial"
  ).length;

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="AI Capabilities Usage Overview"
        description="All Davis AI, Assist, Workflows, and MCP capabilities — activation status, descriptions, and upgrade paths."
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
          <Heading level={2}>
            {activeCount} / {views.length}
          </Heading>
          <Paragraph>Capabilities active</Paragraph>
        </Flex>
        <Flex flexDirection="column">
          <Paragraph>
            {fetchedAt
              ? `Last sync: ${new Date(fetchedAt).toLocaleString()}`
              : "Not synced yet"}
          </Paragraph>
          {isStale && (
            <Paragraph>
              Data is older than 24 hours — refresh to update.
            </Paragraph>
          )}
        </Flex>
      </Flex>

      <Flex flexFlow="wrap" gap={16}>
        {views.map((v) => {
          const usage = usageByCapability.get(v.id);
          return (
          <Flex
            key={v.id}
            flexDirection="column"
            gap={8}
            padding={16}
            style={{
              minWidth: "280px",
              maxWidth: "360px",
              border: "1px solid var(--dt-colors-border-neutral-default)",
              borderRadius: "8px",
            }}
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              gap={8}
            >
              <Heading level={4}>{v.name}</Heading>
              {usage && (
                <Paragraph>
                  <strong>{usage.met}</strong> / {usage.total} used
                </Paragraph>
              )}
            </Flex>
            {usage?.hasCount && (
              <Flex
                alignItems="center"
                gap={8}
                padding={8}
                style={{
                  borderRadius: 6,
                  background: "rgba(0,0,0,0.04)",
                  alignSelf: "flex-start",
                }}
              >
                <Heading level={5}>
                  {usage.utilizationCount.toLocaleString()}
                </Heading>
                <Paragraph>total utilizations (30d)</Paragraph>
              </Flex>
            )}
            <Paragraph>{v.category}</Paragraph>
            <Paragraph>{v.description}</Paragraph>
            <Paragraph>
              Status: <strong>{v.status}</strong>
            </Paragraph>
            <Link
              target="_blank"
              href={v.docUrl}
              rel="noopener noreferrer"
              onClick={() => setStatus(v.id, "active")}
            >
              {v.status === "inactive" ? "Enable / Learn more" : "Documentation"}
            </Link>
          </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
