import React, { useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";
import { getCapability } from "../lib/capability-registry";

const LAST_VISITED_KEY = "ai-optimus.learn.last-visited";

export const LearningCapability = () => {
  const { capabilityId = "" } = useParams();
  const cap = getCapability(capabilityId);

  useEffect(() => {
    if (cap) {
      try {
        window.localStorage.setItem(LAST_VISITED_KEY, cap.id);
      } catch {
        // ignore
      }
    }
  }, [cap]);

  if (!cap) {
    return (
      <Flex flexDirection="column" padding={32} gap={16}>
        <Heading level={2}>Capability not found</Heading>
        <Paragraph>
          The capability <strong>{capabilityId}</strong> is not in the registry.
        </Paragraph>
        <Link as={RouterLink} to="/learn">
          ← Back to Learning Hub
        </Link>
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Link as={RouterLink} to="/learn">
        ← Learning Hub
      </Link>
      <PageHeader title={cap.name} description={cap.description} />

      <Heading level={3}>Key use cases</Heading>
      <ul>
        {cap.useCases.map((uc) => (
          <li key={uc}>{uc}</li>
        ))}
      </ul>

      <Link target="_blank" href={cap.docUrl} rel="noopener noreferrer">
        Open Dynatrace documentation
      </Link>
    </Flex>
  );
};
