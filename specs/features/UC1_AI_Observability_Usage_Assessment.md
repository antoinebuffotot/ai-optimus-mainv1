# Feature: AI Observability Usage Assessment

## Summary
A dashboard view that gives users a clear, real-time picture of how Dynatrace AI Observability capabilities are currently activated and used across their tenant. Users can identify which capabilities are in use, which are available but inactive, and receive prioritised recommendations to close coverage gaps.

## User Stories
- As a platform engineer, I want to see which AI Observability capabilities are active on my tenant so that I can understand the current monitoring coverage without navigating multiple Dynatrace menus.
- As a team lead, I want to track capability adoption over time so that I can demonstrate progress to stakeholders and identify regressions.
- As an administrator, I want to receive gap recommendations so that I can quickly act on unused capabilities that would add value to my environment.
- As a returning user, I want my last-viewed state to be preserved so that I can continue where I left off without re-applying filters.

## Acceptance Criteria
- [ ] The view displays a capability inventory listing all available AI Observability features with an active / inactive / partially active status per feature.
- [ ] A coverage score (0–100%) is computed and displayed at the top of the view, reflecting the percentage of available capabilities that are active on the tenant.
- [ ] Inactive capabilities surface a contextual recommendation card explaining the value of activation and linking directly to the relevant Dynatrace configuration page.
- [ ] Coverage score and capability statuses are refreshed from the Dynatrace API on a maximum 24-hour cadence; a "last synced" timestamp is visible to the user.
- [ ] Users can filter the capability list by category (e.g. Log AI, Metric forecasting, Root cause analysis).
- [ ] Clicking a gap recommendation records a click-through event for KPI tracking (gap click-through rate).
- [ ] The view is accessible without additional Dynatrace permissions beyond those required to open the app.
- [ ] An empty state is shown with guidance if the API returns no capability data.

## Technical Notes
- Capability inventory is fetched via the Dynatrace Settings API (v2) and/or the Environment API; map response fields to the internal capability model at the app layer.
- Coverage score formula: `(active_capabilities / total_available_capabilities) * 100`, rounded to the nearest integer.
- Status sync should be implemented as a scheduled background job; results are cached in app storage to avoid latency on page load.
- Gap recommendation content is maintained as a static config file (JSON/YAML) keyed by capability ID, decoupled from the API fetch so it can be updated independently.
- Click-through events should be emitted as Dynatrace BizEvents with properties: `capability_id`, `tenant_id`, `timestamp`, `source: "gap_recommendation"`.
- Use Dynatrace App Framework (EDP) filter tile and metric card components for consistency with the platform design system.
