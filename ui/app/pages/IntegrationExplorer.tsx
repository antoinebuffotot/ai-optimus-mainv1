import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";

type IntegrationCategory = "ITSM" | "Collaboration" | "Alerting" | "Custom";
type IntegrationComplexity = "Quick start" | "Advanced";

interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  complexity: IntegrationComplexity;
  description: string;
}

const integrations: Integration[] = [
  {
    id: "servicenow",
    name: "ServiceNow",
    category: "ITSM",
    complexity: "Quick start",
    description: "Automate incident creation and bidirectional sync with ServiceNow ITSM.",
  },
  {
    id: "jira",
    name: "Jira",
    category: "ITSM",
    complexity: "Quick start",
    description: "Open Jira issues from Davis problems and keep status in sync.",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Collaboration",
    complexity: "Quick start",
    description: "Route AI-generated alerts and summaries into Slack channels.",
  },
  {
    id: "msteams",
    name: "Microsoft Teams",
    category: "Collaboration",
    complexity: "Quick start",
    description: "Deliver Davis insights into Teams channels for collaborative response.",
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    category: "Alerting",
    complexity: "Quick start",
    description: "Trigger and resolve PagerDuty incidents from Dynatrace.",
  },
  {
    id: "webhook",
    name: "Generic Webhook / REST",
    category: "Custom",
    complexity: "Advanced",
    description: "Parameterisable webhook pattern for any third-party platform.",
  },
];

export const IntegrationExplorer = () => (
  <Flex flexDirection="column" padding={32} gap={16}>
    <PageHeader
      title="MCP Integration Explorer"
      description="Browse integration patterns between Dynatrace MCP and external platforms."
    />

    <Flex flexFlow="wrap" gap={16}>
      {integrations.map((it) => (
        <Flex
          key={it.id}
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
          <Heading level={4}>{it.name}</Heading>
          <Paragraph>
            {it.category} · {it.complexity}
          </Paragraph>
          <Paragraph>{it.description}</Paragraph>
          <Link as={RouterLink} to={`/integrations/${it.id}`}>
            View implementation guide →
          </Link>
        </Flex>
      ))}
    </Flex>
  </Flex>
);
