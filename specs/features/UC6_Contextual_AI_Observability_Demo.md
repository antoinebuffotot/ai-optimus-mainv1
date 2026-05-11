# Feature: Contextual AI Observability Demo

## Summary
An interactive, scenario-based demo experience that allows users to explore Dynatrace AI Observability in the context of their own industry vertical. Users select a business domain (e.g. airport operations, e-commerce, financial services, logistics), and the app presents a realistic, pre-built demo environment showing how Dynatrace AI Observability would surface insights, detect anomalies, and recommend actions in that specific context.

## User Stories
- As a pre-sales engineer, I want to run a contextual AI Observability demo for a prospect without needing a live customer environment so that I can demonstrate value quickly and compellingly.
- As a user evaluating Dynatrace, I want to experience the product in the context of my industry so that I can relate the capabilities to my real operational challenges.
- As a team exploring AI Observability, I want to interact with the demo (not just watch it) so that I can understand how I would actually use the features day to day.
- As a user who found a demo compelling, I want a direct path to starting a real setup so that I can act on my interest immediately after the demo.
- As a product champion, I want to share a link to a specific vertical demo so that I can send it to a colleague or a customer in advance of a meeting.

## Acceptance Criteria
- [ ] A business vertical selector is presented at the demo entry point with at minimum four verticals: Airport operations, E-commerce, Financial services, Logistics.
- [ ] Each vertical demo includes: a simulated environment overview, at least three AI Observability scenarios (e.g. anomaly detection, root cause analysis, predictive alerting), and realistic synthetic data that reflects the vertical's domain (flight delays, order spikes, transaction fraud, delivery exceptions).
- [ ] Demo scenarios are interactive: users can click through steps, trigger simulated events, and observe AI-generated insights responding to those events.
- [ ] A progress indicator shows the user how many scenarios remain in the selected vertical demo.
- [ ] A post-demo summary screen displays the capabilities demonstrated and includes a CTA: "Set this up in my environment" linking to the relevant setup flow (UC4) or capability activation page (UC1/UC2).
- [ ] Demo activation (business selector used) and demo completion events are tracked per vertical for KPI measurement.
- [ ] A post-demo inline relevance rating (1–5) is shown immediately after the summary screen.
- [ ] Each vertical demo is deep-linkable via `/demo/{vertical_id}` so it can be shared externally.
- [ ] The demo runs entirely on pre-built synthetic data; it does not require access to the user's live Dynatrace environment or data.
- [ ] Post-demo actions (clicking "Set this up") are tracked as post-demo action events for the 7-day conversion KPI.

## Technical Notes
- Demo content (scenarios, synthetic data, step sequences) is defined in a per-vertical config file: `{ vertical_id, name, scenarios: [{ id, title, steps: [{ description, simulatedDataSnapshot, aiInsightText }] }] }`.
- Synthetic data snapshots are static JSON payloads rendered by the demo engine; no live API calls are made during the demo to ensure reliability and performance.
- Demo engine: a lightweight state machine that advances through steps on user action; step state is held in React/EDP component state and does not need to be persisted between sessions.
- Demo activation event: BizEvent with `vertical_id`, `event_type: "demo_started"`, `session_id`, `tenant_id`, `timestamp`.
- Demo completion event: BizEvent with `vertical_id`, `event_type: "demo_completed"`, `scenarios_completed`, `session_id`, `timestamp`.
- Post-demo action event: BizEvent with `vertical_id`, `action_type: "setup_initiated" | "capability_clicked"`, `session_id`, `tenant_id`, `timestamp`. This event must also be queryable in a 7-day window from `demo_completed` to compute the post-demo action rate KPI.
- Relevance rating event: BizEvent with `vertical_id`, `rating_value` (1–5), `session_id`, `timestamp`.
- Deep linking: the app router must resolve `/demo/{vertical_id}` and initialise the correct vertical without requiring the user to pass through the selector; the selector should still be accessible via a "Change vertical" control within the demo.
- Accessibility: all interactive demo steps must be keyboard-navigable and screen-reader compatible; synthetic data visualisations must include descriptive alt text or ARIA labels.
- New verticals can be added by dropping a new config file into the content layer without a code change; the vertical selector dynamically renders from the available configs.
