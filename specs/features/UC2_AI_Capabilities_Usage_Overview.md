# Feature: AI Capabilities Usage Overview

## Summary
A consolidated view of all Dynatrace AI capabilities — including Davis AI Intelligence, Assist, Workflows, and MCP — showing activation status, usage metrics, and upgrade paths per capability. Users can assess the breadth of AI tooling in use across their tenant and identify capabilities they are licensed for but not yet using.

## User Stories
- As a platform owner, I want a single view of all AI capabilities available to my tenant so that I can avoid missing features I am already licensed for.
- As a Dynatrace champion, I want to see usage metrics per capability so that I can build a business case for expanding AI adoption internally.
- As a new user, I want to understand what each AI capability does so that I can evaluate its relevance to my team without leaving the app.
- As an administrator, I want to be alerted when capability data is stale so that I can trust the accuracy of what I am looking at.

## Acceptance Criteria
- [ ] All AI capability categories are represented: Davis AI Intelligence, Davis Assist, Dynatrace Workflows (AI-powered), MCP, and any additional capabilities surfaced by the API.
- [ ] Each capability card shows: name, category, activation status, a one-line description, and a link to the relevant Dynatrace documentation or configuration page.
- [ ] Unused capabilities that are included in the tenant's licence are visually distinguished (e.g. "Available — not activated" badge) from capabilities that require a licence upgrade.
- [ ] A data freshness indicator is displayed; the UI shows a warning banner if the last sync is older than 24 hours.
- [ ] Clicking "Enable" or "Learn more" on an unused capability records an upgrade intent event for KPI tracking.
- [ ] Users can filter by capability category and sort by status (active first / inactive first).
- [ ] The view renders correctly with 0, partial, or full capability data (empty, partial, and loaded states are all handled).
- [ ] A summary count is shown at the top: "X of Y capabilities active".

## Technical Notes
- Source capability list from a combination of the Dynatrace Environment API (for activation status) and a static capability registry maintained in the app (for descriptions, categories, and documentation links).
- The static capability registry should be versioned and updatable independently of the app release cycle (e.g. stored as a JSON file in the app's asset layer).
- Upgrade intent events: emit BizEvents with properties `capability_id`, `capability_category`, `action: "enable" | "learn_more"`, `tenant_id`, `timestamp`.
- Data freshness: store last sync timestamp in app state; compare against `Date.now()` on render and display warning if delta > 86 400 000 ms.
- Capability categories enum (initial): `["Intelligence", "Assist", "Workflows", "MCP", "Log AI", "Other"]` — extensible via the registry file.
- For MCP-specific activation status, check for the presence of an active MCP server configuration via the MCP management API endpoint (if available) or infer from settings.
