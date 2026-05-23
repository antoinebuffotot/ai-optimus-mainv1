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
import { getIntegrationGuide } from "../lib/integration-content";

export const IntegrationDetail = () => {
  const { platformId = "" } = useParams();
  const guide = getIntegrationGuide(platformId);

  if (!guide) {
    return (
      <Flex flexDirection="column" padding={32} gap={16}>
        <Link as={RouterLink} to="/integrations">
          ← Integration Explorer
        </Link>
        <Heading level={2}>Integration not found</Heading>
        <Paragraph>
          No implementation guide is available for{" "}
          <strong>{platformId}</strong>.
        </Paragraph>
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Link as={RouterLink} to="/integrations">
        ← Integration Explorer
      </Link>
      <PageHeader
        title={`${guide.name} integration`}
        description={guide.overview}
      />

      {guide.sections.map((section, i) => (
        <GuideSection key={i} section={section} />
      ))}
    </Flex>
  );
};
