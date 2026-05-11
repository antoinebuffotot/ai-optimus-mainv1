import React from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export const PageHeader = ({
  title,
  description,
  actions,
}: PageHeaderProps) => (
  <Flex
    justifyContent="space-between"
    alignItems="flex-start"
    paddingBottom={16}
    flexWrap="wrap"
    gap={16}
  >
    <Flex flexDirection="column" gap={4}>
      <Heading level={1}>{title}</Heading>
      {description && <Paragraph>{description}</Paragraph>}
    </Flex>
    {actions && <Flex gap={8}>{actions}</Flex>}
  </Flex>
);
