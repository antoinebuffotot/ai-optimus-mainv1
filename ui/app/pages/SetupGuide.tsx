import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import {
  Heading,
  Paragraph,
  Link,
} from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";
import { GuideSection } from "../components/GuideSection";
import { getSetupGuide, setupGuides } from "../lib/setup-content";

export const SetupGuide = () => {
  const { setupType } = useParams();
  const guide = setupType ? getSetupGuide(setupType) : undefined;

  if (!setupType) {
    return (
      <Flex flexDirection="column" padding={32} gap={16}>
        <PageHeader
          title="MCP & DTCTL IDE Setup"
          description="Guided, step-by-step setup of Dynatrace MCP or DTCTL inside your IDE."
        />
        <Flex flexFlow="wrap" gap={16}>
          {setupGuides.map((g) => (
            <Flex
              key={g.id}
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
              <Heading level={4}>{g.name}</Heading>
              <Paragraph>{g.overview}</Paragraph>
              <Link as={RouterLink} to={`/setup/${g.id}`}>
                Set up {g.id.toUpperCase()} →
              </Link>
            </Flex>
          ))}
        </Flex>
      </Flex>
    );
  }

  if (!guide) {
    return (
      <Flex flexDirection="column" padding={32} gap={16}>
        <Link as={RouterLink} to="/setup">
          ← Setup
        </Link>
        <Heading level={2}>Setup guide not found</Heading>
        <Paragraph>
          No setup guide is available for <strong>{setupType}</strong>.
        </Paragraph>
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Link as={RouterLink} to="/setup">
        ← Setup
      </Link>
      <PageHeader title={guide.name} description={guide.overview} />

      {guide.sections.map((section, i) => (
        <GuideSection key={i} section={section} />
      ))}
    </Flex>
  );
};
