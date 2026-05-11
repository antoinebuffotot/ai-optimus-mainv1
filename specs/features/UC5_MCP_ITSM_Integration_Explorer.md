# Feature: Dynatrace MCP Integration Explorer (ITSM & Third-Party Platforms)

## Summary
An interactive exploration section that helps users understand the integration possibilities between Dynatrace MCP and external platforms — including ITSM tools (ServiceNow, Jira), collaboration platforms (Slack, Microsoft Teams), and other enterprise systems. Users can browse integration patterns, view architecture diagrams, access implementation guides, and understand the business value of each integration.

## User Stories
- As a platform engineer, I want to explore how Dynatrace MCP connects to ServiceNow so that I can evaluate whether to automate incident management workflows.
- As an architect, I want to see the integration architecture for each platform so that I can plan the technical implementation before committing resources.
- As a team evaluating Dynatrace, I want to download or share an integration guide so that I can circulate it internally for review.
- As a user who has completed an integration, I want to confirm which platform I connected so that the app can tailor future recommendations to my setup.
- As a product champion, I want to see which integrations are most popular or recommended so that I can prioritise what to pitch to my organisation.

## Acceptance Criteria
- [ ] A catalogue of integration patterns is available, covering at minimum: ServiceNow, Jira, Slack, Microsoft Teams, PagerDuty, and a generic webhook / REST API pattern.
- [ ] Each integration entry includes: platform name and logo, integration type (incident automation, alert routing, workflow trigger, etc.), a short description of the use case, an architecture diagram or flow illustration, and a link to the implementation guide.
- [ ] A filter allows users to browse by integration type (ITSM, Collaboration, Alerting, Custom) and by complexity (Quick start / Advanced).
- [ ] Each integration page has a prominent CTA ("View implementation guide") that opens the guide in a new tab or triggers an in-app document viewer; clicks are tracked as intent conversion events.
- [ ] Users can mark an integration as "Already connected" to personalise their view and feed usage data back to the app.
- [ ] Integration pages explored per session are tracked as events for KPI measurement (use-case breadth).
- [ ] Return visits to the integration section are tracked per user for stickiness measurement.
- [ ] An empty or error state is shown gracefully if integration content fails to load.
- [ ] Integration pages are deep-linkable via `/integrations/{platform_id}` URLs.

## Technical Notes
- Integration catalogue is maintained as a static config (JSON) bundled with or fetched from the app's content layer; schema per entry: `{ id, name, category, complexity, description, useCases[], architectureDiagramUrl, guideUrl, logoUrl }`.
- Architecture diagrams should be stored as SVG assets for scalability and accessibility; provide alt text for each.
- Intent conversion events: emit BizEvents with `integration_id`, `platform_name`, `action: "view_guide" | "mark_connected"`, `session_id`, `tenant_id`, `timestamp`.
- Page view events: emit BizEvents with `integration_id`, `event_type: "integration_page_opened"`, `session_id`, `timestamp`.
- "Already connected" state: persist selected integrations in app state (EDP state management or `localStorage`); optionally cross-reference with Dynatrace webhook/integration API to auto-detect active integrations.
- Return visit tracking: record the `session_id` and `userId` each time the integrations section is entered; compare against prior sessions server-side or via a BizEvent query to compute the stickiness KPI.
- For the generic REST/webhook pattern, provide a parameterisable guide template that generates a sample payload based on the user's tenant URL.
- Complexity classification: "Quick start" = no custom code required, connectable via UI configuration alone; "Advanced" = requires scripting, custom payload mapping, or infrastructure changes.
