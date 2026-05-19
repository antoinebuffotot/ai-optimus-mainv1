import React, { useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import {
  Heading,
  Paragraph,
  Link,
} from "@dynatrace/strato-components/typography";
import {
  Accordion,
  CodeSnippet,
  ProgressBar,
} from "@dynatrace/strato-components/content";
import { PageHeader } from "../components/PageHeader";
import { getCapability } from "../lib/capability-registry";
import { getLearningContent } from "../lib/learning-content";
import { useLearningActivity } from "../hooks/useLearningActivity";

const LAST_VISITED_KEY = "ai-optimus.learn.last-visited";

export const LearningCapability = () => {
  const { capabilityId = "" } = useParams();
  const cap = getCapability(capabilityId);
  const content = getLearningContent(capabilityId);
  const { trackSubjectOpen, trackItemOpen, isOpened, subjectScore } =
    useLearningActivity();

  useEffect(() => {
    if (!cap) return;
    try {
      window.localStorage.setItem(LAST_VISITED_KEY, cap.id);
    } catch {
      // ignore
    }
    trackSubjectOpen(cap.id);
  }, [cap, trackSubjectOpen]);

  if (!cap) {
    return (
      <Flex flexDirection="column" padding={32} gap={16}>
        <Heading level={2}>Capability not found</Heading>
        <Paragraph>
          The capability <strong>{capabilityId}</strong> is not in the registry.
        </Paragraph>
        <Link as={RouterLink} to="/learn">
          ← Back to Learning Hub
        </Link>
      </Flex>
    );
  }

  const score = subjectScore(cap.id);

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Link as={RouterLink} to="/learn">
        ← Learning Hub
      </Link>
      <PageHeader title={cap.name} description={cap.description} />

      <Flex flexDirection="column" gap={4}>
        <Paragraph>
          <strong>Your progress on this subject:</strong> {score}%
        </Paragraph>
        <ProgressBar value={score} aria-label={`${cap.name} learning progress`}>
          <ProgressBar.Label>Subject progress</ProgressBar.Label>
          <ProgressBar.Value />
        </ProgressBar>
      </Flex>

      {content ? (
        (() => {
          const allPrereqsOpened = content.prerequisites.every((p) =>
            isOpened(cap.id, "prerequisite", p.id)
          );
          return (
            <>
              <Paragraph>{content.overview}</Paragraph>

              <Heading level={3}>Prerequisites</Heading>
              <Paragraph>
                <em>
                  Open each prerequisite in order, from top to bottom. The next
                  item unlocks once the previous one is opened.
                </em>
              </Paragraph>
              <Accordion
                multiple
                onExpandChange={(value) => {
                  const ids = Array.isArray(value) ? value : [value];
                  ids
                    .map((v) => String(v))
                    .filter((id) => id && !isOpened(cap.id, "prerequisite", id))
                    .forEach((id) =>
                      trackItemOpen(cap.id, "prerequisite", id)
                    );
                }}
              >
                {content.prerequisites.map((p, idx) => {
                  const previousOpened =
                    idx === 0 ||
                    isOpened(
                      cap.id,
                      "prerequisite",
                      content.prerequisites[idx - 1].id
                    );
                  const opened = isOpened(cap.id, "prerequisite", p.id);
                  const disabled = !previousOpened && !opened;
                  return (
                    <Accordion.Section
                      key={p.id}
                      id={p.id}
                      disabled={disabled}
                    >
                      <Accordion.SectionLabel>
                        {p.title}
                        {opened ? " ✓" : disabled ? " 🔒" : ""}
                      </Accordion.SectionLabel>
                      <Accordion.SectionContent>
                        <Flex flexDirection="column" gap={8}>
                          <Paragraph>{p.body}</Paragraph>
                          {p.link && (
                            <Link
                              target="_blank"
                              href={p.link.href}
                              rel="noopener noreferrer"
                            >
                              {p.link.label}
                            </Link>
                          )}
                        </Flex>
                      </Accordion.SectionContent>
                    </Accordion.Section>
                  );
                })}
              </Accordion>

              {(() => {
                const groups =
                  content.stepGroups && content.stepGroups.length > 0
                    ? content.stepGroups
                    : [{ id: "steps", title: "Steps", startIndex: 0 }];
                return (
                  <>
                    <Paragraph>
                      <em>
                        Open each step in order, from top to bottom. All
                        prerequisites above must be opened before the first
                        step unlocks. Ordering carries across sub-sections.
                      </em>
                    </Paragraph>
                    {groups.map((group, groupIdx) => {
                      const nextStart =
                        groups[groupIdx + 1]?.startIndex ??
                        content.steps.length;
                      const groupSteps = content.steps.slice(
                        group.startIndex,
                        nextStart
                      );
                      return (
                        <React.Fragment key={group.id}>
                          <Heading level={3}>{group.title}</Heading>
                          <Accordion
                            multiple
                            onExpandChange={(value) => {
                              const ids = Array.isArray(value)
                                ? value
                                : [value];
                              ids
                                .map((v) => String(v))
                                .filter(
                                  (id) =>
                                    id && !isOpened(cap.id, "step", id)
                                )
                                .forEach((id) =>
                                  trackItemOpen(cap.id, "step", id)
                                );
                            }}
                          >
                            {groupSteps.map((s, localIdx) => {
                              const globalIdx = group.startIndex + localIdx;
                              const previousStepOpened =
                                globalIdx === 0 ||
                                isOpened(
                                  cap.id,
                                  "step",
                                  content.steps[globalIdx - 1].id
                                );
                              const opened = isOpened(cap.id, "step", s.id);
                              const unlocked =
                                allPrereqsOpened && previousStepOpened;
                              const disabled = !unlocked && !opened;
                              return (
                                <Accordion.Section
                                  key={s.id}
                                  id={s.id}
                                  disabled={disabled}
                                >
                                  <Accordion.SectionLabel>
                                    {`${globalIdx + 1}. ${s.title}`}
                                    {opened ? " ✓" : disabled ? " 🔒" : ""}
                                  </Accordion.SectionLabel>
                                  <Accordion.SectionContent>
                                    <Flex flexDirection="column" gap={8}>
                                      <Paragraph>{s.body}</Paragraph>
                                      {s.code && (
                                        <CodeSnippet
                                          language={s.code.language}
                                        >
                                          {s.code.content}
                                        </CodeSnippet>
                                      )}
                                      {s.link && (
                                        <Link
                                          target="_blank"
                                          href={s.link.href}
                                          rel="noopener noreferrer"
                                        >
                                          {s.link.label}
                                        </Link>
                                      )}
                                    </Flex>
                                  </Accordion.SectionContent>
                                </Accordion.Section>
                              );
                            })}
                          </Accordion>
                        </React.Fragment>
                      );
                    })}
                  </>
                );
              })()}
            </>
          );
        })()
      ) : (
        <Paragraph>
          Detailed prerequisites and steps for this subject are not yet
          available. See the documentation link below.
        </Paragraph>
      )}

      <Heading level={3}>Key use cases</Heading>
      <ul>
        {cap.useCases.map((uc) => (
          <li key={uc}>{uc}</li>
        ))}
      </ul>

      <Link target="_blank" href={cap.docUrl} rel="noopener noreferrer">
        Open Dynatrace documentation
      </Link>
    </Flex>
  );
};
