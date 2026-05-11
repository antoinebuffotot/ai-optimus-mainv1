import React, { useReducer } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph, Link } from "@dynatrace/strato-components/typography";
import { Button } from "@dynatrace/strato-components/buttons";
import { PageHeader } from "../components/PageHeader";

type State = { step: number; total: number };
type Action = { type: "next" } | { type: "reset" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "next":
      return { ...state, step: Math.min(state.step + 1, state.total) };
    case "reset":
      return { ...state, step: 0 };
  }
};

export const DemoVertical = () => {
  const { verticalId = "" } = useParams();
  const [state, dispatch] = useReducer(reducer, { step: 0, total: 3 });
  const completed = state.step >= state.total;

  return (
    <Flex flexDirection="column" padding={32} gap={16}>
      <Link as={RouterLink} to="/demo">
        ← Change vertical
      </Link>
      <PageHeader
        title={`${verticalId} demo`}
        description="Lightweight state machine over pre-built synthetic scenarios (ADR-0006). No live tenant data is used."
      />

      <Paragraph>
        Scenario {Math.min(state.step + 1, state.total)} of {state.total}
      </Paragraph>

      {!completed ? (
        <Flex flexDirection="column" gap={8}>
          <Heading level={3}>Step {state.step + 1}</Heading>
          <Paragraph>
            Synthetic scenario content for <strong>{verticalId}</strong> goes
            here. Loaded from <code>assets/demo-scenarios/{verticalId}.json</code>{" "}
            in UC6 follow-up work.
          </Paragraph>
          <Button onClick={() => dispatch({ type: "next" })}>
            {state.step + 1 === state.total ? "Finish" : "Next step"}
          </Button>
        </Flex>
      ) : (
        <Flex flexDirection="column" gap={8}>
          <Heading level={3}>Demo complete</Heading>
          <Paragraph>
            You experienced the {verticalId} scenarios. Ready to set this up in
            your environment?
          </Paragraph>
          <Flex gap={16}>
            <Link as={RouterLink} to="/setup">
              Set this up →
            </Link>
            <Link as={RouterLink} to="/assessment">
              Check coverage →
            </Link>
            <Button onClick={() => dispatch({ type: "reset" })} variant="default">
              Replay demo
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
