import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";

interface Vertical {
  id: string;
  name: string;
  blurb: string;
}

const verticals: Vertical[] = [
  {
    id: "airport-ops",
    name: "Airport operations",
    blurb: "Flight delays, gate utilisation, baggage system anomalies.",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    blurb: "Order spikes, checkout latency, fraud signals.",
  },
  {
    id: "financial-services",
    name: "Financial services",
    blurb: "Transaction fraud detection, latency-sensitive trading APIs.",
  },
  {
    id: "logistics",
    name: "Logistics",
    blurb: "Delivery exceptions, route optimisation, fleet telemetry.",
  },
];

export const Demo = () => (
  <Flex flexDirection="column" padding={32} gap={16}>
    <PageHeader
      title="Contextual AI Observability Demo"
      description="Pick a business vertical to explore Davis insights, anomaly detection, and root-cause analysis on realistic synthetic data."
    />

    <Flex flexFlow="wrap" gap={16}>
      {verticals.map((v) => (
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
          <Paragraph>{v.blurb}</Paragraph>
          <Link as={RouterLink} to={`/demo/${v.id}`}>
            Start demo →
          </Link>
        </Flex>
      ))}
    </Flex>
  </Flex>
);
