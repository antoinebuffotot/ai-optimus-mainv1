---
title: "ADR-0001: Capability Inventory Architecture with Hybrid API + Static Config"
status: "Proposed"
date: "2026-05-10"
authors: "Architecture Team"
tags: ["architecture", "api-integration", "data-model"]
supersedes: ""
superseded_by: ""
---

# ADR-0001: Capability Inventory Architecture with Hybrid API + Static Config

## Status

**Proposed** | Accepted | Rejected | Superseded | Deprecated

## Context

The AI Observability Usage Assessment feature (UC1) requires users to understand which AI capabilities are currently active on their tenant in real-time. Capability status (active/inactive/partially active) changes based on tenant configuration, while capability descriptions, categories, and gap recommendations are relatively static. A naive approach of fetching all capability metadata from a single API endpoint would create a tight coupling between app releases and API schema changes, limiting the ability to add new recommendations or modify descriptions without deploying the app.

## Decision

Implement a **hybrid architecture** combining:
1. **Dynatrace Settings API v2 and Environment API** for dynamic capability activation status
2. **Static capability registry** (JSON/YAML config file) bundled with the app for descriptions, categories, and gap recommendation content
3. **Server-side scheduled sync** that polls API status on a maximum 24-hour cadence and caches results in app storage
4. **Client-side composition** that merges API status with static registry at render time

This separation enables independent updates to recommendation content without app redeployment while maintaining real-time accuracy of capability activation states.

## Consequences

### Positive

- **POS-001**: Content updates (descriptions, recommendations) can be deployed independently of app releases via config file versioning
- **POS-002**: API changes only require updates to the status-fetch logic; capability metadata remains decoupled
- **POS-003**: Cached status reduces latency on page load, improving UX for users with slow network connections
- **POS-004**: Easier to test content changes in staging without requiring API or app redeployment
- **POS-005**: Static registry serves as source of truth for capability taxonomy, enabling consistency across all features (UC2, UC3)
- **POS-006**: 24-hour sync cadence aligns with typical enterprise change windows, avoiding constant polling

### Negative

- **NEG-001**: Capability status may lag real-time by up to 24 hours if user changes configuration outside the app
- **NEG-002**: Increased implementation complexity: requires background job orchestration, cache invalidation logic, and error handling for API failures
- **NEG-003**: Must maintain synchronization between API schema and app's internal capability model; breaking API changes require careful migration
- **NEG-004**: Static registry file must be manually versioned and kept in sync with actual available capabilities in Dynatrace
- **NEG-005**: If app storage fails, status cache is lost and user sees stale data until next sync window completes

## Alternatives Considered

### Alternative 1: Real-time API Status on Every Page Load

- **ALT-001**: **Description**: Fetch complete capability status and metadata from API on every page render, eliminating caching
- **ALT-002**: **Rejection Reason**: Introduces latency (network round-trip) on every page load; poor UX in high-latency environments; excessive API load during peak usage times; user experience depends on API availability

### Alternative 2: All Static, Manual Update Process

- **ALT-003**: **Description**: Store all capability status in a manually-curated static config; no API integration
- **ALT-004**: **Rejection Reason**: Breaks requirement for real-time activation status; users cannot see current environment state; requires manual updates by support team, introducing delay and error risk

### Alternative 3: Purely Client-Side Sync with User Polling

- **ALT-005**: **Description**: Store sync timestamp in localStorage; allow user to manually trigger refresh via "Sync now" button, no background job
- **ALT-006**: **Rejection Reason**: Violates acceptance criterion for automatic 24-hour refresh cadence; places burden on user to maintain current data; poor discoverability of stale data warning

## Implementation Notes

- **IMP-001**: Define capability model schema in static registry: `{ id, name, category, description, active, partiallyActive, recommendationText, recommendationLink }`
- **IMP-002**: Implement AppFunction or backend service to orchestrate API polling; use scheduled task (cron or AppEngine scheduler) to execute every 24 hours
- **IMP-003**: Store sync result in app storage under key like `capabilities:status:cache` with TTL of 24 hours; include last-synced timestamp
- **IMP-004**: On API failure, log error and continue serving cached data; display warning banner if cache is older than 24 hours
- **IMP-005**: Coverage score formula: `(active_count / total_capability_count) * 100`, rounded to nearest integer
- **IMP-006**: Implement cache invalidation strategy: allow admin users or specific scopes to manually trigger immediate sync if needed
- **IMP-007**: Version the static registry file; document breaking changes to schema in CHANGELOG
- **IMP-008**: Emit BizEvent on successful sync with properties: `sync_timestamp`, `capabilities_count`, `active_count`, `coverage_score`

## References

- **REF-001**: Dynatrace Settings API v2 documentation and Environment API schema
- **REF-002**: ADR-0002 (Capability Learning Hub Content Structure) — related decision on static capability registry
- **REF-003**: Dynatrace AppEngine scheduler and AppFunction capabilities
- **REF-004**: App Storage Service API documentation
