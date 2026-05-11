import React, { useDeferredValue, useMemo, useState } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { TextInput } from "@dynatrace/strato-components/forms";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@dynatrace/strato-components/typography";
import { PageHeader } from "../components/PageHeader";
import { registry } from "../lib/capability-registry";

export const LearningHub = () => {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

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

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="AI & AI Observability Learning Hub"
        description="Browse capability overviews, key use cases, and documentation. Search filters in real time."
      />

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
            {items.map((c) => (
              <Flex key={c.id} flexDirection="column" gap={4}>
                <Link as={RouterLink} to={`/learn/${c.id}`}>
                  {c.name}
                </Link>
                <Paragraph>{c.description}</Paragraph>
              </Flex>
            ))}
          </Flex>
        ))
      )}
    </Flex>
  );
};
