# Feature: MCP & DTCTL IDE Setup Guide

## Summary
A guided, step-by-step setup flow that enables users to configure Dynatrace MCP or DTCTL as tools within their IDE (VS Code, IntelliJ, Cursor, and others). The flow detects the user's environment where possible, generates the required configuration snippets, and confirms a successful connection — reducing setup time to under 10 minutes.

## User Stories
- As a developer, I want a guided setup flow for MCP in my IDE so that I can integrate Dynatrace AI assistance into my daily workflow without reading lengthy documentation.
- As a developer, I want to choose between MCP and DTCTL setup paths so that I can pick the integration style that fits my toolchain.
- As a user mid-setup, I want to see exactly where I am in the process so that I can resume confidently if I am interrupted.
- As a user who encounters an error, I want clear troubleshooting guidance so that I can resolve the issue without raising a support ticket.
- As a team lead, I want to share the setup guide URL with my team so that everyone can follow the same standardised flow.

## Acceptance Criteria
- [ ] The setup entry point offers a clear choice between MCP setup and DTCTL setup with a brief description of each.
- [ ] Each setup path is broken into clearly numbered steps with a progress indicator showing current step and total steps.
- [ ] The flow supports the following IDEs: VS Code, IntelliJ IDEA, Cursor; an "Other / manual" path is available for unsupported IDEs.
- [ ] Configuration snippets (JSON, YAML, or shell commands) are generated dynamically using the user's tenant URL and API token, pre-populated into copy-to-clipboard code blocks.
- [ ] A connection verification step is included at the end of each path; the app polls or prompts the user to confirm a successful connection.
- [ ] Step-level funnel events are emitted at each step entry and exit for drop-off analysis.
- [ ] If a step results in an error (detected or self-reported), a contextual troubleshooting tip is displayed inline without leaving the flow.
- [ ] The entire MCP setup flow can be completed in under 10 minutes for a user following the steps for the first time (validated via median time-to-setup KPI).
- [ ] The flow is resumable: if a user leaves mid-flow and returns, they are offered the option to continue from their last completed step.
- [ ] A "Share this guide" button generates a deep-linkable URL to the setup flow entry point.

## Technical Notes
- Flow state (current step, selected IDE, selected path) is persisted in `localStorage` keyed by `{ userId, setupType }` to support resume.
- Tenant URL and API token are pulled from the app's authenticated session context; never stored in plaintext beyond the active session.
- Dynamic snippet generation: use a template string approach with `{{ tenantUrl }}` and `{{ apiToken }}` placeholders substituted at render time.
- Connection verification for MCP: attempt a lightweight ping to the MCP server endpoint configured in the snippet; display success/failure inline. Fallback to a manual "I've confirmed it works" checkbox if the ping is not feasible due to network constraints.
- Funnel events: emit BizEvents with `setup_type: "mcp" | "dtctl"`, `ide_type`, `step_number`, `event_type: "step_entered" | "step_completed" | "step_errored"`, `session_id`, `timestamp`.
- Error detection: wrap verification calls in try/catch; map common error codes to human-readable troubleshooting messages stored in a static error-message config.
- IDE detection: attempt to infer IDE from `navigator.userAgent` or a URL parameter passed by an IDE extension; default to manual selection if detection is ambiguous.
- The "Other / manual" path should render the raw config files with annotations, linking to the relevant sections of the Dynatrace public documentation.
