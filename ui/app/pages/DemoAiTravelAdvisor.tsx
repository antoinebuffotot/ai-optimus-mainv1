import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Link, Paragraph } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";
import { useDemoUrls } from "../hooks/useDemoUrls";

const VERTICAL_ID = "ai-travel-advisor";

export const DemoAiTravelAdvisor = () => {
  const { getUrl } = useDemoUrls();
  const url = getUrl(VERTICAL_ID);

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Link as={RouterLink} to="/demo">
        ← Change vertical
      </Link>
      <PageHeader
        title="AI travel advisor"
        description="Trip advisor powered by AI"
      />
      {url ? (
        <iframe
          src={url}
          title="AI travel advisor"
          style={{
            width: "100%",
            height: "calc(100vh - 220px)",
            border: "1px solid var(--dt-colors-border-neutral-default)",
            borderRadius: 8,
          }}
        />
      ) : (
        <Paragraph>
          No URL configured for this demo. An admin can set one from the Admin
          page.
        </Paragraph>
      )}
    </Flex>
  );
};
