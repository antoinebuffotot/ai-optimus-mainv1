import React, { useEffect, useMemo, useState } from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { Button } from "@dynatrace/strato-components/buttons";
import { Accordion } from "@dynatrace/strato-components/content";
import { TextInput } from "@dynatrace/strato-components/forms";
import { PageHeader } from "../components/PageHeader";
import {
  computeOverallScore,
  computeSubjectScore,
  hasCompletedSubject,
  hasStartedSubject,
  useAllLearningActivity,
} from "../hooks/useLearningActivity";
import { useDemoUrls, DemoUrlEntry } from "../hooks/useDemoUrls";
import { learningContent } from "../lib/learning-content";
import { getCapability } from "../lib/capability-registry";

const DemoUrlRow = ({
  entry,
  onSave,
  onReset,
}: {
  entry: DemoUrlEntry;
  onSave: (id: string, url: string) => Promise<void>;
  onReset: (id: string) => Promise<void>;
}) => {
  const [draft, setDraft] = useState(entry.effectiveUrl);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);

  useEffect(() => {
    setDraft(entry.effectiveUrl);
  }, [entry.effectiveUrl]);

  const dirty = draft.trim() !== entry.effectiveUrl;

  const handleSave = async () => {
    const next = draft.trim();
    if (!next || next === entry.effectiveUrl) return;
    setBusy("save");
    try {
      await onSave(entry.id, next);
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async () => {
    setBusy("reset");
    try {
      await onReset(entry.id);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Flex
      flexDirection="column"
      padding={12}
      gap={8}
      style={{
        borderRadius: 8,
        border: "1px solid var(--dt-colors-border-neutral-default)",
      }}
    >
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={8}>
        <Heading level={4}>{entry.name}</Heading>
        <Paragraph>
          {entry.hasOverride ? "Custom override" : "Default URL"}
        </Paragraph>
      </Flex>
      <Paragraph>
        <strong>Default:</strong> {entry.defaultUrl}
      </Paragraph>
      <TextInput
        type="url"
        value={draft}
        onChange={setDraft}
        placeholder="https://example.com"
      />
      <Flex gap={8} flexWrap="wrap">
        <Button
          variant="accent"
          onClick={() => void handleSave()}
          disabled={!dirty || draft.trim() === ""}
          loading={busy === "save"}
        >
          Save
        </Button>
        <Button
          variant="default"
          onClick={() => void handleReset()}
          disabled={!entry.hasOverride}
          loading={busy === "reset"}
        >
          Reset to default
        </Button>
      </Flex>
    </Flex>
  );
};

const formatTimestamp = (ts: number | null | undefined): string =>
  !ts ? "—" : new Date(ts).toLocaleString();

const subjectStatus = (
  capabilityId: string,
  activity: ReturnType<typeof useAllLearningActivity>["users"][number]["state"][string]
): string => {
  if (hasCompletedSubject(capabilityId, activity)) return "completed";
  if (hasStartedSubject(activity)) return "in progress";
  return "not started";
};

export const Admin = () => {
  const { users, stats, isLoading, error, refresh, resetUser } =
    useAllLearningActivity();
  const {
    entries: demoUrlEntries,
    setUrl: setDemoUrl,
    resetUrl: resetDemoUrl,
    error: demoUrlError,
  } = useDemoUrls();
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) =>
        a.userEmail.localeCompare(b.userEmail)
      ),
    [users]
  );

  const handleReset = async (email: string) => {
    setResettingEmail(email);
    try {
      await resetUser(email);
      await refresh();
    } finally {
      setResettingEmail(null);
      setConfirmEmail(null);
    }
  };

  return (
    <Flex flexDirection="column" padding={32} gap={24}>
      <PageHeader
        title="Admin"
        description="Inspect every user's Learning activity and reset progression on demand."
        actions={
          <Button
            onClick={() => void refresh()}
            loading={isLoading}
            variant="default"
          >
            Refresh
          </Button>
        }
      />

      <Flex gap={32} alignItems="center" flexWrap="wrap">
        <Flex flexDirection="column">
          <Heading level={2}>{stats.totalUsers}</Heading>
          <Paragraph>Tracked users</Paragraph>
        </Flex>
        <Flex flexDirection="column">
          <Heading level={2}>{stats.startedCount}</Heading>
          <Paragraph>Users started Learning</Paragraph>
        </Flex>
        <Flex flexDirection="column">
          <Heading level={2}>{stats.completedCount}</Heading>
          <Paragraph>Users completed Learning</Paragraph>
        </Flex>
        <Flex flexDirection="column">
          <Heading level={2}>{stats.completionPercent}%</Heading>
          <Paragraph>Overall completion</Paragraph>
        </Flex>
      </Flex>

      {error && (
        <Paragraph>
          Shared state error: <strong>{error.message}</strong>
        </Paragraph>
      )}

      {sortedUsers.length === 0 ? (
        <Paragraph>No users have any Learning activity yet.</Paragraph>
      ) : (
        <Accordion multiple>
          {sortedUsers.map((u) => {
            const overall = computeOverallScore(u.state);
            const started = learningContent.filter((c) =>
              hasStartedSubject(u.state[c.capabilityId])
            ).length;
            const completed = learningContent.filter((c) =>
              hasCompletedSubject(c.capabilityId, u.state[c.capabilityId])
            ).length;
            const isConfirming = confirmEmail === u.userEmail;
            const isResetting = resettingEmail === u.userEmail;
            return (
              <Accordion.Section key={u.userEmail} id={u.userEmail}>
                <Accordion.SectionLabel>
                  {`${u.userEmail} — ${overall}% · ${started} started · ${completed} completed`}
                </Accordion.SectionLabel>
                <Accordion.SectionContent>
                  <Flex flexDirection="column" gap={12}>
                    <Flex gap={24} flexWrap="wrap">
                      {learningContent.map((c) => {
                        const cap = getCapability(c.capabilityId);
                        const activity = u.state[c.capabilityId];
                        const score = computeSubjectScore(
                          c.capabilityId,
                          activity
                        );
                        return (
                          <Flex
                            key={c.capabilityId}
                            flexDirection="column"
                            padding={12}
                            gap={4}
                            style={{
                              minWidth: 220,
                              borderRadius: 8,
                              background: "rgba(0,0,0,0.04)",
                            }}
                          >
                            <Paragraph>
                              <strong>{cap?.name ?? c.capabilityId}</strong>
                            </Paragraph>
                            <Paragraph>
                              Status: {subjectStatus(c.capabilityId, activity)}
                            </Paragraph>
                            <Paragraph>Score: {score}%</Paragraph>
                            <Paragraph>
                              Last opened:{" "}
                              {formatTimestamp(activity?.openedAt)}
                            </Paragraph>
                          </Flex>
                        );
                      })}
                    </Flex>

                    <Flex gap={8} alignItems="center" flexWrap="wrap">
                      {isConfirming ? (
                        <>
                          <Paragraph>
                            Reset all Learning progression for{" "}
                            <strong>{u.userEmail}</strong>?
                          </Paragraph>
                          <Button
                            variant="accent"
                            color="critical"
                            onClick={() => void handleReset(u.userEmail)}
                            loading={isResetting}
                          >
                            Confirm reset
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => setConfirmEmail(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          color="critical"
                          onClick={() => setConfirmEmail(u.userEmail)}
                          disabled={isResetting}
                        >
                          Reset progression
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Accordion.SectionContent>
              </Accordion.Section>
            );
          })}
        </Accordion>
      )}

      <Flex flexDirection="column" gap={12}>
        <Heading level={2}>Demo URLs</Heading>
        <Paragraph>
          URLs that back the iframes on the Demo pages. Changes are shared
          across all users.
        </Paragraph>
        {demoUrlError && (
          <Paragraph>
            Demo URL state error: <strong>{demoUrlError.message}</strong>
          </Paragraph>
        )}
        {demoUrlEntries.length === 0 ? (
          <Paragraph>No demos with configurable URLs.</Paragraph>
        ) : (
          <Flex flexFlow="wrap" gap={12}>
            {demoUrlEntries.map((entry) => (
              <Flex
                key={entry.id}
                flexDirection="column"
                style={{ minWidth: 360, flex: "1 1 360px" }}
              >
                <DemoUrlRow
                  entry={entry}
                  onSave={setDemoUrl}
                  onReset={resetDemoUrl}
                />
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
