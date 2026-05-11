---
title: "ADR-0006: Synthetic Data Demo Engine with Lightweight State Machine"
status: "Proposed"
date: "2026-05-10"
authors: "Architecture Team"
tags: ["architecture", "demo", "state-machine", "performance"]
supersedes: ""
superseded_by: ""
---

# ADR-0006: Synthetic Data Demo Engine with Lightweight State Machine

## Status

**Proposed** | Accepted | Rejected | Superseded | Deprecated

## Context

The Contextual AI Observability Demo (UC6) presents pre-built, scenario-based demo experiences simulating AI Observability in different business verticals (airport, e-commerce, finance, logistics). The demo must work entirely on synthetic data without making calls to a user's live Dynatrace environment, ensuring reliability, performance, and offline capability. The demo flow advances through steps (scenario selection → step 1 → step 2 → summary), with user interactions triggering state transitions.

Two approaches are possible:
1. **Stateful server-side**: backend maintains demo session state, routes requests, serves data
2. **Client-side state machine**: all state held in React, no server calls except for metrics/analytics

Client-side is simpler and faster for this use case, as demo content is static and predetermined.

## Decision

Implement a **lightweight client-side state machine** for demo progression:

1. **Demo state** held in React component state: `{ selectedVertical, currentScenario, currentStep, demoStartedAt, completionTime }`
2. **No backend calls** during demo playback: all scenario steps, synthetic data, and AI insights are pre-defined in static config files
3. **Config per vertical**: each vertical (airport, e-commerce, etc.) has a separate config file defining scenarios and steps
4. **Step structure**: each step includes description, simulated data snapshot (static JSON), and AI-generated insight text
5. **Analytics only**: emit BizEvents on demo start, step completion, and demo finish; no backend state synchronization

This approach prioritizes performance and simplicity over persistent state or cross-device resume.

## Consequences

### Positive

- **POS-001**: Demo is fast and responsive; no network latency between steps
- **POS-002**: Extremely reliable: works offline, does not depend on API availability or network connectivity
- **POS-003**: Simple implementation: straightforward React state management, no need for complex server orchestration
- **POS-004**: Each vertical config file is independent; new verticals can be added without touching demo engine code
- **POS-005**: No cross-user state pollution: each demo session is isolated, starting fresh
- **POS-006**: Easy to test: demo logic is deterministic and does not depend on external data sources
- **POS-007**: Reduced server load: no backend infrastructure needed for demo playback

### Negative

- **NEG-001**: Demo state is not persistent: if user closes browser mid-demo, progress is lost (no resume capability)
- **NEG-002**: No cross-device sync: user cannot start demo on desktop and resume on mobile
- **NEG-003**: Vertical configs must be bundled with the app; adding or updating a vertical requires app rebuild/redeploy
- **NEG-004**: Cannot personalize demo based on real user environment (e.g., "show KPIs for your actual infrastructure")
- **NEG-005**: Synthetic data is static; cannot reflect real-time changes or user-specific scenarios

## Alternatives Considered

### Alternative 1: Server-Side Demo Session Management

- **ALT-001**: **Description**: Backend maintains demo session state; client sends step-completion requests; server advances state and returns next step data
- **ALT-002**: **Rejection Reason**: Introduces network latency (100+ ms per step); increases server infrastructure burden; overkill for deterministic, pre-built demo flow; reduces reliability if server is unavailable

### Alternative 2: Database-Driven Scenarios

- **ALT-003**: **Description**: Store all demo scenarios in Dynatrace Document Service; app fetches configs at runtime
- **ALT-004**: **Rejection Reason**: Adds API call overhead; requires additional scopes; harder to manage versioning of scenarios; increases complexity; not faster than bundled configs

### Alternative 3: Live Environment Simulation

- **ALT-005**: **Description**: Create temporary demo environment in Dynatrace; ingest synthetic data in real-time; show actual Dynatrace UI rendering live data
- **ALT-006**: **Rejection Reason**: Extremely complex; requires environment provisioning infrastructure; slow setup (5–10 min per demo); costly (compute/storage for temporary envs); requires real Dynatrace access and credentials; defeats purpose of quick pre-sales demo

## Implementation Notes

- **IMP-001**: Define demo state structure:
  ```typescript
  interface DemoState {
    selectedVertical?: string;
    currentScenarioIndex: number;
    currentStepIndex: number;
    demoStartedAt: number;
    stepStartedAt: number;
    completedSteps: number[];
  }
  ```
- **IMP-002**: Define config structure per vertical:
  ```typescript
  interface VerticalConfig {
    id: string;
    name: string;
    scenarios: {
      id: string;
      title: string;
      steps: {
        description: string;
        simulatedDataSnapshot: Record<string, any>;
        aiInsightText: string;
      }[];
    }[];
  }
  ```
- **IMP-003**: Store vertical configs in `src/assets/demo-scenarios/{vertical-id}.json`; import and validate at build time
- **IMP-004**: Implement demo state reducer using `useReducer` hook with actions: `SELECT_VERTICAL`, `NEXT_STEP`, `PREVIOUS_STEP`, `RESTART_DEMO`, `COMPLETE_DEMO`
- **IMP-005**: Each step displays: step description, simulated data visualization (chart/table), AI insight text, "Next Step" / "Previous Step" buttons
- **IMP-006**: Emit BizEvents with timestamps:
  - `demo_started`: `{ verticalId, sessionId, timestamp }`
  - `step_completed`: `{ verticalId, scenarioIndex, stepIndex, timeOnStep, sessionId, timestamp }`
  - `demo_completed`: `{ verticalId, totalTime, scenariosCompleted, sessionId, timestamp }`
  - `post_demo_action`: `{ verticalId, actionType: "setup_initiated" | "capability_clicked", sessionId, timestamp }`
- **IMP-007**: Post-demo summary screen includes "Set this up in my environment" CTA; clicking records action event and navigates to UC1 or UC4 setup flow
- **IMP-008**: Implement deep linking: `/demo/{verticalId}` bypasses vertical selector and initializes demo for that vertical
- **IMP-009**: Ensure keyboard navigation: all buttons and interactive elements are keyboard-accessible; tab order is logical
- **IMP-010**: Test synthetic data visualizations for accessibility: include ARIA labels, data tables have proper headers, charts have text descriptions

## References

- **REF-001**: UC6 (Contextual AI Observability Demo) specification — defines demo scenarios and flow
- **REF-002**: React Hooks documentation (`useState`, `useReducer`, `useCallback`)
- **REF-003**: State machine design patterns and finites state machines
- **REF-004**: WCAG 2.1 accessibility guidelines for interactive demos
- **REF-005**: Performance best practices for demo applications
