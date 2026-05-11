# Feature: AI & AI Observability Capability Learning Hub

## Summary
An in-app learning section that gives users structured, discoverable access to educational content about all Dynatrace AI and AI Observability capabilities. Users can browse by category, read capability overviews, watch short explainer content, and rate helpfulness — all without leaving the app.

## User Stories
- As a developer new to Dynatrace AI, I want to browse all AI capabilities in one place so that I can quickly understand what is available and relevant to my use case.
- As a team lead, I want to share a direct link to a specific capability page with my team so that I can onboard colleagues efficiently.
- As a user exploring the app, I want to see personalised suggestions based on my tenant's current usage gaps so that the learning content feels relevant rather than generic.
- As a returning user, I want to pick up where I left off so that I do not have to re-navigate to the content I was reading.
- As any user, I want to rate the helpfulness of content so that the team can improve low-quality pages.

## Acceptance Criteria
- [ ] A browsable catalogue of all AI and AI Observability capabilities is available, grouped by category (e.g. Intelligence, Assist, Workflows, MCP, Log AI, AI Observability).
- [ ] Each capability page includes: a title, a short description (2–4 sentences), key use cases (bullet list), a link to the official Dynatrace documentation, and optionally an embedded short video or demo link.
- [ ] A search field filters the catalogue in real time by capability name or keyword.
- [ ] Capability pages surface a contextual "You could enable this" call-to-action if the capability is inactive on the user's tenant (integrates with UC1/UC2 status data).
- [ ] A helpfulness rating widget (thumbs up / thumbs down or 1–5 stars) is present on every capability page; ratings are submitted as events.
- [ ] Breadcrumb navigation and deep-linkable URLs are supported so that specific pages can be shared.
- [ ] The "last visited" capability page is restored on next app open (stored in browser/app local state).
- [ ] Content items opened per session are tracked as events for KPI measurement (content consumption rate).
- [ ] The catalogue renders an appropriate empty or error state if content fails to load.

## Technical Notes
- Capability content is maintained as a structured content config (JSON or MDX files) bundled with the app or fetched from a CDN; this decouples content updates from app releases.
- Content config schema per entry: `{ id, name, category, description, useCases[], docUrl, videoUrl?, relatedCapabilityIds[] }`.
- Real-time search: implement client-side filtering against the in-memory content list using a debounced input (300 ms debounce); no server call needed for search.
- "You could enable this" CTA: cross-reference capability `id` against the activation status data fetched by UC1/UC2; show CTA only when status is `inactive` and licence permits activation.
- Rating events: emit BizEvents with `capability_id`, `rating_value`, `rating_type: "thumbs" | "stars"`, `tenant_id`, `timestamp`.
- Content consumption events: emit BizEvents with `capability_id`, `event_type: "page_open"`, `session_id`, `timestamp`.
- Deep linking: each capability page maps to a URL path `/learn/{capability_id}`; the app router must handle direct navigation to these paths.
- For session restoration, store the last visited `capability_id` in `localStorage` and navigate to it on app initialisation if no explicit route is present.
