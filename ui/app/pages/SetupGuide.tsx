import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";

type SetupType = "mcp" | "dtctl";
const SETUP_TYPES: SetupType[] = ["mcp", "dtctl"];
const isSetupType = (v: string | undefined): v is SetupType =>
  SETUP_TYPES.includes(v as SetupType);

export const SetupGuide = () => {
  const { setupType } = useParams();
  const active = isSetupType(setupType) ? setupType : null;

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <PageHeader
        title={active ? `${active.toUpperCase()} setup` : "MCP & DTCTL IDE Setup"}
        description="Guided, step-by-step setup of Dynatrace MCP or DTCTL inside your IDE."
      />

      {!active && (
        <Flex gap={16}>
          <Link as={RouterLink} to="/setup/mcp">
            Set up MCP →
          </Link>
          <Link as={RouterLink} to="/setup/dtctl">
            Set up DTCTL →
          </Link>
        </Flex>
      )}

      {active && (
        <Flex flexDirection="column" gap={8}>
          <Heading level={3}>Steps</Heading>
          <Paragraph>1. Choose your IDE (VS Code, IntelliJ, Cursor, Other)</Paragraph>
          <Paragraph>2. Generate the configuration snippet</Paragraph>
          <Paragraph>3. Paste it into your IDE settings</Paragraph>
          <Paragraph>4. Verify the connection</Paragraph>
          <Paragraph>
            Step state is persisted to localStorage per ADR-0004 so users can
            resume after interruptions.
          </Paragraph>
          <Link as={RouterLink} to="/setup">
            ← Back
          </Link>
        </Flex>
      )}
    </Flex>
  );
};
