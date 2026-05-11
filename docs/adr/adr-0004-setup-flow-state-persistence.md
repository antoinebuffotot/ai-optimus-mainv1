---
title: "ADR-0004: Step-Based Setup Flow with Client-Side State Persistence"
status: "Proposed"
date: "2026-05-10"
authors: "Architecture Team"
tags: ["architecture", "state-management", "ux-flow", "setup"]
supersedes: ""
superseded_by: ""
---

# ADR-0004: Step-Based Setup Flow with Client-Side State Persistence

## Status

**Proposed** | Accepted | Rejected | Superseded | Deprecated

## Context

The MCP & DTCTL IDE Setup Guide (UC4) guides users through a multi-step configuration process (5–10 steps depending on IDE choice). Users may interrupt setup, leave the app, and return later expecting to resume from where they left off. Storing setup state requires a decision: should state be persisted locally (browser storage), on the server (app state service), or in the Dynatrace environment?

Local storage is fastest and requires no backend infrastructure; server-side persistence is more robust but introduces latency and backend complexity. The setup flow is typically completed in a single session (median time ~10 minutes), making session-local state acceptable for most users.

## Decision

Implement setup state persistence using **localStorage** keyed by `{ userId, setupType }` to enable resumable flows:

```javascript
const stateKey = `setup:${userId}:${setupType}`;
localStorage.setItem(stateKey, JSON.stringify({
  currentStep: 3,
  selectedIde: "vscode",
  setupType: "mcp",
  completedSteps: [0, 1, 2],
  timestamp: Date.now()
}));
```

On app load, check for saved state and offer user the option to resume or start fresh. State is cleared after setup completion or after 30 days of inactivity (TTL).

## Consequences

### Positive

- **POS-001**: No backend dependency: setup flow works entirely client-side, improving resilience and reducing infrastructure cost
- **POS-002**: Instant resume: user can close app mid-setup and pick up instantly on return, within the same browser
- **POS-003**: Simple implementation: leverages browser APIs, no need for additional state management or API calls
- **POS-004**: Fast: no network round-trip for state retrieval; state is immediately available on app mount
- **POS-005**: User retains control: setup state is stored locally, not synced to Dynatrace or shared across devices
- **POS-006**: Enables analytics: can track resume rate and step drop-off by comparing start counts to completion counts

### Negative

- **NEG-001**: State is device/browser-specific: if user switches browsers or clears localStorage, setup progress is lost
- **NEG-002**: No cross-device continuity: user cannot start setup on desktop and resume on mobile
- **NEG-003**: Cannot implement server-side analytics on resume behavior without additional tracking calls
- **NEG-004**: If localStorage quota is exceeded (typically 5–10 MB), state save silently fails without user notification
- **NEG-005**: Potential security concern if browser is shared: another user on the same device can see or resume the setup
- **NEG-006**: TTL-based cleanup (30 days) requires manual implementation; no browser mechanism to automatically expire entries

## Alternatives Considered

### Alternative 1: Server-Side State in Dynatrace App State Service

- **ALT-001**: **Description**: Store setup state in Dynatrace App State Service; sync state between devices; multi-session resilience
- **ALT-002**: **Rejection Reason**: Adds network latency on every state read/write; requires additional scopes and API calls; increases complexity; overkill for a 10-minute setup flow; adds backend infrastructure burden

### Alternative 2: No State Persistence, Always Start Fresh

- **ALT-003**: **Description**: Clear all setup state on app unload; force users to restart from step 1 if they leave mid-flow
- **ALT-004**: **Rejection Reason**: Violates UC4 acceptance criterion for resumable flows; poor UX for users with unreliable connections; increases setup friction and drop-off

### Alternative 3: URL Query Parameters for State (Stateless Resume)

- **ALT-005**: **Description**: Encode setup state in URL query params (e.g., `?step=3&ide=vscode`); user can bookmark and resume via URL
- **ALT-006**: **Rejection Reason**: URL becomes unwieldy with complex state; exposed state in browser history; not suitable for sensitive data (API tokens); less discoverable to end users

## Implementation Notes

- **IMP-001**: Define TypeScript interface for setup state:
  ```typescript
  interface SetupState {
    userId: string;
    setupType: "mcp" | "dtctl";
    currentStep: number;
    selectedIde: "vscode" | "intellij" | "cursor" | "other";
    completedSteps: number[];
    startedAt: number;
    lastUpdated: number;
  }
  ```
- **IMP-002**: Create utility functions: `saveSetupState()`, `loadSetupState()`, `clearSetupState()`, `isStateExpired()`
- **IMP-003**: On app mount, call `loadSetupState()`; if valid and not expired, show prompt: "Resume setup from step 3?" with "Resume" / "Start Fresh" buttons
- **IMP-004**: Implement auto-save on every step completion; debounce writes (e.g., 500 ms) to avoid excessive localStorage calls
- **IMP-005**: Add error handling for localStorage quota exceeded; catch errors and fallback to in-memory state (warn user about loss of resume capability)
- **IMP-006**: Implement TTL: expire state after 30 days of inactivity (compare `lastUpdated` vs current time)
- **IMP-007**: On setup completion, emit BizEvent with properties `setupType`, `completionTime`, `stepsToCompletion`, then clear localStorage
- **IMP-008**: Consider clearing state on browser logout/session expiration; integrate with Dynatrace auth lifecycle

## References

- **REF-001**: UC4 (MCP & DTCTL IDE Setup Guide) specification — defines resumable setup requirement
- **REF-002**: MDN Web Docs — localStorage API and quotas
- **REF-003**: Dynatrace App State Service API (alternative approach for future consideration)
- **REF-004**: WCAG 2.1 guidelines for stateful UX (accessibility for session resumption)
