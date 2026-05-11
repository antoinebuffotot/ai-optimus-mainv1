import React from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { Card } from "../components/Card";

const tiles = [
  {
    href: "/assessment",
    name: "AI Observability Assessment",
    imgSrc: "./assets/data.png",
  },
  {
    href: "/usage",
    name: "Capabilities Usage Assessment",
    imgSrc: "./assets/data.png",
  },
  {
    href: "/capabilities",
    name: "AI Capabilities Overview",
    imgSrc: "./assets/data.png",
  },
  {
    href: "/learn",
    name: "Learning Hub",
    imgSrc: "./assets/devportal.png",
  },
  {
    href: "/setup",
    name: "MCP / DTCTL IDE Setup",
    imgSrc: "./assets/devportal.png",
  },
  {
    href: "/integrations",
    name: "Integration Explorer",
    imgSrc: "./assets/community.png",
  },
  {
    href: "/demo",
    name: "Contextual AI Demo",
    imgSrc: "./assets/community.png",
  },
];

export const Home = () => (
  <Flex flexDirection="column" alignItems="center" padding={32} gap={16}>
    <img
      src="./assets/Dynatrace_Logo.svg"
      alt="Dynatrace"
      width={120}
      height={120}
    />
    <Heading>AI Optimus</Heading>
    <Paragraph>
      Understand, observe, and use Dynatrace agentic AI at scale.
    </Paragraph>
    <Flex gap={32} paddingTop={32} flexWrap="wrap" justifyContent="center">
      {tiles.map((t) => (
        <Card
          key={t.href}
          href={t.href}
          inAppLink
          imgSrc={t.imgSrc}
          name={t.name}
        />
      ))}
    </Flex>
  </Flex>
);
