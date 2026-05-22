import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";

const AI_TRAVEL_ADVISOR_URL =
  "http://aiobsanb202500.westeurope.cloudapp.azure.com:30100/";

export const DemoAiTravelAdvisor = () => (
  <Flex flexDirection="column" padding={32} gap={16}>
    <Link as={RouterLink} to="/demo">
      ← Change vertical
    </Link>
    <PageHeader
      title="AI travel advisor"
      description="Trip advisor powered by AI"
    />
    <iframe
      src={AI_TRAVEL_ADVISOR_URL}
      title="AI travel advisor"
      style={{
        width: "100%",
        height: "calc(100vh - 220px)",
        border: "1px solid var(--dt-colors-border-neutral-default)",
        borderRadius: 8,
      }}
    />
  </Flex>
);
