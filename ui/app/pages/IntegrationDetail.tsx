import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";

export const IntegrationDetail = () => {
  const { platformId = "" } = useParams();
  const diagramSrc = `./assets/diagrams/${platformId}-architecture.svg`;

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Link as={RouterLink} to="/integrations">
        ← Integration Explorer
      </Link>
      <PageHeader
        title={`${platformId} integration`}
        description="Architecture overview, implementation steps, and links to documentation."
      />

      <Heading level={3}>Architecture</Heading>
      <img
        src={diagramSrc}
        alt={`${platformId} architecture diagram`}
        style={{ maxWidth: "100%" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <Paragraph>
        Diagrams are stored as SVG assets per ADR-0005; if the diagram is
        missing the section above will be hidden and the textual description
        below remains.
      </Paragraph>

      <Heading level={3}>Next steps</Heading>
      <Paragraph>
        Implementation guide and "Mark as connected" controls will be added in
        UC5 follow-up work.
      </Paragraph>
    </Flex>
  );
};
