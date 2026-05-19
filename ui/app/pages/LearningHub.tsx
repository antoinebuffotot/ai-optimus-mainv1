import React, { useDeferredValue, useMemo, useState } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { TextInput } from "@dynatrace/strato-components/forms";
import {
  ProgressBar,
  ProgressCircle,
} from "@dynatrace/strato-components/content";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";
import { registry } from "../lib/capability-registry";
import {
  computeOverallScore,
  useLearningActivity,
} from "../hooks/useLearningActivity";
import { getLearningContent } from "../lib/learning-content";

export const LearningHub = () => {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const { state, subjectScore, userEmail } = useLearningActivity();

  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return registry.capabilities;
    return registry.capabilities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [deferred]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof results>();
    for (const c of results) {
      const list = m.get(c.category) ?? [];
      list.push(c);
      m.set(c.category, list);
    }
    return Array.from(m.entries());
  }, [results]);

  const overallScore = useMemo(() => computeOverallScore(state), [state]);

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="AI & AI Observability Learning Hub"
        description="Browse capability overviews, key use cases, and documentation. Search filters in real time."
      />

      <Flex gap={32} alignItems="center" flexWrap="wrap">
        <Flex
          flexDirection="column"
          alignItems="center"
          padding={16}
          style={{
            minWidth: 180,
            borderRadius: 8,
            background: "rgba(0,0,0,0.04)",
          }}
        >
          <Heading level={2}>{overallScore}%</Heading>
          <Paragraph>Overall learning progress</Paragraph>
        </Flex>
        <ProgressCircle
          value={overallScore}
          size="large"
          aria-label="Overall learning progress"
        />
        {userEmail && userEmail !== "anonymous" && (
          <Paragraph>for {userEmail}</Paragraph>
        )}
      </Flex>

      <TextInput
        value={query}
        onChange={setQuery}
        placeholder="Search capabilities…"
      />

      {grouped.length === 0 ? (
        <Paragraph>No capabilities match your search.</Paragraph>
      ) : (
        grouped.map(([cat, items]) => (
          <Flex key={cat} flexDirection="column" gap={8}>
            <Heading level={3}>{cat}</Heading>
            {items.map((c) => {
              const hasContent = Boolean(getLearningContent(c.id));
              const score = subjectScore(c.id);
              return (
                <Flex key={c.id} flexDirection="column" gap={4}>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    gap={16}
                    flexWrap="wrap"
                  >
                    <Link as={RouterLink} to={`/learn/${c.id}`}>
                      {c.name}
                    </Link>
                    {hasContent && (
                      <Paragraph>Score: {score}%</Paragraph>
                    )}
                  </Flex>
                  <Paragraph>{c.description}</Paragraph>
                  {hasContent && (
                    <ProgressBar
                      value={score}
                      aria-label={`${c.name} learning progress`}
                    >
                      <ProgressBar.Value />
                    </ProgressBar>
                  )}
                </Flex>
              );
            })}
          </Flex>
        ))
      )}
    </Flex>
  );
};
