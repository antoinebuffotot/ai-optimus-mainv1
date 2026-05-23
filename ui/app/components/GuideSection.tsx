import React from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import {
  Heading,
  Paragraph,
  Link,
} from "@dynatrace/strato-components/typography";
import { CodeSnippet } from "@dynatrace/strato-components/content";

export type GuideCodeLanguage =
  | "yaml"
  | "javascript"
  | "json"
  | "bash"
  | "markdown"
  | "typescript";

export type GuideSectionData =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "ordered-list";
      items: Array<string | { text: string; sub?: string[] }>;
    }
  | {
      type: "code";
      language: GuideCodeLanguage;
      content: string;
      title?: string;
    }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "ascii"; content: string }
  | { type: "note"; text: string }
  | { type: "link"; label: string; href: string };

export const GuideSection = ({ section }: { section: GuideSectionData }) => {
  switch (section.type) {
    case "heading":
      return <Heading level={section.level}>{section.text}</Heading>;
    case "paragraph":
      return <Paragraph>{section.text}</Paragraph>;
    case "list":
      return (
        <ul style={{ margin: 0, paddingLeft: 24 }}>
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ordered-list":
      return (
        <ol style={{ margin: 0, paddingLeft: 24 }}>
          {section.items.map((item, i) => {
            if (typeof item === "string") {
              return <li key={i}>{item}</li>;
            }
            return (
              <li key={i}>
                {item.text}
                {item.sub && item.sub.length > 0 && (
                  <ul style={{ marginTop: 4, paddingLeft: 24 }}>
                    {item.sub.map((s, si) => (
                      <li key={si}>{s}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      );
    case "code":
      return (
        <Flex flexDirection="column" gap={4}>
          {section.title && (
            <Paragraph>
              <strong>{section.title}</strong>
            </Paragraph>
          )}
          <CodeSnippet language={section.language}>
            {section.content}
          </CodeSnippet>
        </Flex>
      );
    case "table":
      return (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            border: "1px solid var(--dt-colors-border-neutral-default)",
          }}
        >
          <thead>
            <tr>
              {section.headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    borderBottom:
                      "1px solid var(--dt-colors-border-neutral-default)",
                    background: "var(--dt-colors-background-surface-default)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    style={{
                      padding: "8px 12px",
                      borderBottom:
                        "1px solid var(--dt-colors-border-neutral-default)",
                      verticalAlign: "top",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "ascii":
      return (
        <pre
          style={{
            background: "var(--dt-colors-background-surface-default)",
            border: "1px solid var(--dt-colors-border-neutral-default)",
            borderRadius: 6,
            padding: 12,
            overflow: "auto",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          {section.content}
        </pre>
      );
    case "note":
      return (
        <Flex
          padding={12}
          style={{
            borderLeft: "4px solid var(--dt-colors-border-primary-default)",
            background: "var(--dt-colors-background-surface-default)",
            borderRadius: 4,
          }}
        >
          <Paragraph>
            <strong>Note:</strong> {section.text}
          </Paragraph>
        </Flex>
      );
    case "link":
      return (
        <Link target="_blank" href={section.href} rel="noopener noreferrer">
          {section.label}
        </Link>
      );
    default:
      return null;
  }
};
