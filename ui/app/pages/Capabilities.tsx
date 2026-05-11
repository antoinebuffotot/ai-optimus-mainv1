import React from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";
import { useCapabilityStatus } from "../hooks/useCapabilityStatus";

export const Capabilities = () => {
  const { views, fetchedAt, isStale, setStatus } = useCapabilityStatus();
  const activeCount = views.filter(
    (v) => v.status === "active" || v.status === "partial"
  ).length;

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="AI Capabilities Usage Overview"
        description="All Davis AI, Assist, Workflows, and MCP capabilities — activation status, descriptions, and upgrade paths."
      />

      <Paragraph>
        <strong>
          {activeCount} of {views.length}
        </strong>{" "}
        capabilities active
        {fetchedAt
          ? ` — last sync ${new Date(fetchedAt).toLocaleString()}`
          : " — not synced yet"}
        {isStale && " (stale)"}
      </Paragraph>

      <Flex flexFlow="wrap" gap={16}>
        {views.map((v) => (
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
            <Heading level={4}>{v.name}</Heading>
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
        ))}
      </Flex>
    </Flex>
  );
};
