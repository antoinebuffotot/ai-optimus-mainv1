---
title: "Unified Architecture Decisions - AI Optimus App"
status: "Proposed"
date: "2026-05-10"
authors: "Architecture Team"
tags: ["architecture", "overview", "design-decisions"]
---

# Unified Architecture Decisions - AI Optimus App

## Overview

This document consolidates all architectural decisions across the AI Optimus project, which comprises six feature use cases (UC1–UC6) spanning observability, learning, integration guidance, and demo experiences. The architecture prioritizes:

- **Performance**: Client-side operations where possible, caching strategies, no unnecessary API calls
- **Resilience**: Offline-capable flows, graceful fallbacks, decoupled components
- **Maintainability**: Single source of truth for capability metadata, versioned configs, separation of concerns
- **Scalability**: Static content decoupled from app releases, extensible patterns for new capabilities and integrations
- **User Experience**: Real-time search, resumable flows, seamless cross-feature navigation

---

## Architectural Pillars

### 1. **Unified Capability Registry** (ADR-0002)

**Problem**: Multiple features need consistent access to capability metadata (names, descriptions, categories, documentation links).

**Solution**: Maintain a single, versioned JSON capability registry bundled with the app as the source of truth for all capability-related information.

**Impact on Features**:
- UC1 (Usage Assessment): Maps API status to registry entries
- UC2 (Usage Overview): Displays capability cards from registry
- UC3 (Learning Hub): Serves learning content metadata from registry
- UC5 (Integration Explorer): Cross-references capabilities with integrations

**Key Properties**:
```json
{
  "version": "1.0.0",
  "capabilities": [
    {
      "id": "davis-intelligence",
      "name": "Davis AI Intelligence",
      "category": "Intelligence",
      "description": "...",
      "useCases": ["..."],
      "docUrl": "https://...",
      "videoUrl": "https://...",
      "relatedCapabilityIds": ["..."]
    }
  ]
}
```

---

### 2. **Hybrid API + Cache Architecture** (ADR-0001)

**Problem**: Capability activation status must be real-time (from API), but capability metadata should be static (decoupled from releases).

**Solution**: Fetch capability status from Dynatrace Settings/Environment APIs on a 24-hour cadence; cache results in app storage; merge with static registry at render time.

**Architecture Diagram**:
```
┌─────────────────────────────────────────────────────┐
│                Dynatrace API                        │
│      (Settings v2 + Environment API)                │
│         [Real-time Status Data]                     │
└────────────┬────────────────────────────────────────┘
             │ 24-hour poll
             ▼
┌─────────────────────────────────────────────────────┐
│              App Storage (Cache)                    │
│         [Capability Status + Timestamp]             │
└────────────┬────────────────────────────────────────┘
             │
             │ On page load
             ▼
┌──────────────────────┬──────────────────────────────┐
│  Static Registry     │    Cached API Status         │
│  (Bundled)           │    (App Storage)             │
│  [Metadata]          │    [Live Status]             │
└──────────────────────┴──────────────────────────────┘
             │
             └──────────┬───────────────────┐
                        ▼                   ▼
                   UC1 Dashboard         UC2 Overview
```

**Benefits**:
- Status is real-time (max 24h lag)
- Metadata updates are independent of app releases
- Fast page loads via caching
- Works offline with cached data

---

### 3. **Client-Side Operations** (ADR-0003, ADR-0004, ADR-0006)

**Core Philosophy**: Execute operations in the browser whenever possible to improve performance, resilience, and user experience.

#### Search (ADR-0003) — UC3 Learning Hub
- **300ms debounced input** filters capability catalogue in-memory
- No server API calls
- Instant feedback, works offline
- Simple, testable implementation

#### Setup Flow State (ADR-0004) — UC4 IDE Setup Guide
- **localStorage-based state persistence** enables resumable multi-step flows
- Keyed by `{ userId, setupType }` for device-specific resume
- 30-day TTL auto-cleanup
- No backend infrastructure needed

#### Demo Engine (ADR-0006) — UC6 AI Observability Demo
- **Lightweight state machine** in React controls demo progression
- All scenario steps pre-defined in static config files
- No API calls during demo playback
- Works completely offline, 100% reliable

**Pattern Summary**:
| Concern | Implementation | Benefit |
|---------|----------------|---------|
| Search | In-memory filter + debounce | Instant, offline-capable |
| State | localStorage | Resumable, no backend |
| Demo | State machine + static config | Fast, reliable, offline |

---

### 4. **Content Decoupling** (ADR-0002, ADR-0005, ADR-0006)

**Principle**: Separate content from code to enable independent updates.

#### Static Content Assets:
- **Capability Registry** (`src/assets/capability-registry.json`): descriptions, categories, use cases
- **SVG Diagrams** (`src/assets/diagrams/`): integration architecture visualizations
- **Demo Scenarios** (`src/assets/demo-scenarios/`): vertical-specific simulation configs

**Benefits**:
- Content updates don't require app rebuild
- Easy to version and track changes
- Different teams can manage content independently
- Supports A/B testing of descriptions/messaging

**Update Workflow**:
```
Content Updated
    ▼
Config File Changed (JSON/YAML/SVG)
    ▼
Validated at Build Time (Schema + Syntax)
    ▼
Bundled with App or Deployed to CDN
    ▼
Fetched by App at Runtime (or bundled)
```

---

### 5. **SVG-Based Visualization** (ADR-0005)

**Problem**: Integration architecture diagrams must be scalable, accessible, and easy to version.

**Solution**: Store all diagrams as SVG assets with semantic markup and ARIA labels.

**Implementation**:
- Location: `src/assets/diagrams/{integration-id}-architecture.svg`
- Naming: `servicenow-architecture.svg`, `jira-architecture.svg`, etc.
- Markup: `<title>`, `<desc>`, `role="img"`, `aria-labelledby`
- Styling: CSS classes (not inline) for light/dark mode theming

**Advantages**:
- Infinite scalability, no DPI artifacts
- 2–5x smaller than PNG for technical diagrams
- Accessible to screen readers
- Text-based, version-control friendly
- Can animate without extra tooling

---

## Cross-Feature Architecture Map

```
┌──────────────────────────────────────────────────────────────────┐
│                      AI Optimus App Core                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   Unified Capability Registry (ADR-0002)               │   │
│  │   Single source of truth for all capabilities          │   │
│  │   - Descriptions, categories, use cases                │   │
│  │   - Documentation links                                │   │
│  │   - Learning content metadata                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ▲                                     │
│         ┌─────────────────┼─────────────────┬──────────────┐   │
│         │                 │                 │              │   │
│    ┌────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌────▼──┐ │
│    │    UC1    │  │     UC2     │  │     UC3     │  │  UC5  │ │
│    │ Assessment│  │   Overview  │  │ Learning    │  │ Integ.│ │
│    │ (Status)  │  │ (Capabilities)│ │ Hub(Content)│  │(Guides)│ │
│    │           │  │             │  │             │  │       │ │
│    │ + Hybrid  │  │             │  │ + Client-   │  │ + SVG │ │
│    │   API +   │  │             │  │   side      │  │ Diagr.│ │
│    │   Cache   │  │             │  │   Search    │  │       │ │
│    └───────────┘  └─────────────┘  └─────────────┘  └───────┘ │
│                                                                  │
│    ┌─────────────────────────┐      ┌─────────────────────┐    │
│    │         UC4             │      │        UC6          │    │
│    │   MCP/DTCTL Setup       │      │ AI Observability    │    │
│    │                         │      │ Demo                │    │
│    │ + Step-based Flow       │      │                     │    │
│    │ + localStorage Persist. │      │ + State Machine     │    │
│    │                         │      │ + Synthetic Data    │    │
│    └─────────────────────────┘      └─────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack & Dependencies

### Frontend Framework
- **React** with TypeScript
- **Strato Design System** components (`@dynatrace/strato-components*`)
- **React Hooks** for state management (`useMemo`, `useReducer`, `useCallback`)

### Data & APIs
- **Dynatrace Settings API v2** and **Environment API** (capability status)
- **Dynatrace App State Service** (user/app-specific storage)
- **Dynatrace Document Service** (dashboard/integration docs)
- **BizEvents** for KPI tracking and analytics

### Storage & Caching
- **localStorage** (client-side): setup flow state, last-visited page
- **App Storage Service** (Dynatrace): shared capability status cache

### Content Assets
- **JSON files**: capability registry, demo scenarios
- **SVG files**: integration architecture diagrams
- **Markdown files**: ADRs, architecture documentation

---

## Key Design Decisions Summary

| ADR | Feature | Decision | Rationale |
|-----|---------|----------|-----------|
| 0001 | UC1 | Hybrid API + Cache (24h) | Real-time status + fast loads |
| 0002 | UC1-5 | Unified Registry (JSON) | Single source of truth, decoupled updates |
| 0003 | UC3 | Client-side Search (300ms debounce) | Instant feedback, offline-capable |
| 0004 | UC4 | localStorage State Persistence | Device-specific resume, no backend |
| 0005 | UC5 | SVG Diagrams | Scalable, accessible, version-friendly |
| 0006 | UC6 | State Machine + Static Configs | Reliable, offline demo, fast |

---

## Performance & Scalability Characteristics

### Load Performance
- **Initial Page Load**: ~1–2s (includes registry load, no API calls if cache valid)
- **Cache Hit**: ~500ms (cached status prevents API round-trip)
- **Search Latency**: <50ms (in-memory filter, no network)
- **Demo Startup**: <500ms (state machine init, no API calls)

### Caching Strategy
- **Capability Status**: 24-hour TTL in app storage
- **User Preferences**: Session-based in localStorage
- **Content Assets**: Bundled with app, no CDN calls (future: consider CDN for large images)
- **API Results**: Cache on first fetch, refresh on 24-hour cadence

### Scalability Considerations
- **Capability Count**: Registry tested with 50+ capabilities; client-side search remains <100ms
- **User Concurrency**: No backend load from demos or search; minimal API load (once per 24h per user)
- **Bundle Size**: Registry (~50 KB uncompressed), SVGs (~30 KB total), demo configs (~20 KB) = ~100 KB added content
- **Storage Quota**: localStorage usage <1 MB per user (setup state + preferences)

---

## Error Handling & Fallbacks

### API Failure (Capability Status)
1. If API call fails: log error, continue serving cached data
2. Display warning banner: "Capability data is stale (last synced 3 days ago)"
3. Offer manual refresh button for immediate retry
4. Cache TTL extends gracefully up to 7 days before showing error state

### Missing Registry Entry
1. Validate registry schema at build time (catch missing entries)
2. If entry missing at runtime: skip capability in UI, log warning
3. Do not crash app; render "Capability unavailable" message

### localStorage Quota Exceeded
1. Catch quota error in state save
2. Log warning; disable setup state persistence for current session
3. Display info: "Your browser storage is full; setup progress will not be saved"
4. Demo and search continue unaffected

### SVG Diagram Load Failure
1. Use `<img>` onerror fallback: render placeholder or alt text
2. Log error for monitoring
3. Provide text-based fallback description

---

## Analytics & KPI Tracking

All major user actions emit BizEvents for KPI measurement:

### UC1 (Assessment)
- Coverage score KPIs: trending coverage % over time
- Gap click-through rate: % of users who click on inactive capability recommendations

### UC2 (Overview)
- Capability activation patterns: which capabilities most commonly active/inactive
- Upgrade intent events: users interested in enabling new capabilities

### UC3 (Learning Hub)
- Content consumption rate: pages viewed per session
- Search usage: most popular searches, zero-result queries
- Helpfulness ratings: 1–5 star feedback on learning content

### UC4 (Setup Flow)
- Step completion rate (funnel): drop-off analysis by step
- Time-to-setup KPI: median minutes from step 1 to completion
- Error recovery: users who encounter and resolve errors

### UC5 (Integration Explorer)
- Integration interest: which integrations viewed most often
- Intent conversion: "view guide" and "mark connected" actions
- Return visit stickiness: sessions per user per week

### UC6 (Demo)
- Demo activation: which verticals most popular
- Demo completion rate: % of starters who finish
- Post-demo action rate: % who click "Set this up" within 7 days
- Relevance rating: average satisfaction (1–5) per vertical

---

## Future Extensibility

### Adding a New Capability
1. Add entry to `src/assets/capability-registry.json`
2. Validate schema at build time
3. Automatically surfaces in UC1, UC2, UC3
4. Optionally add to UC5 integrations

### Adding a New Business Vertical (Demo)
1. Create `src/assets/demo-scenarios/{vertical-id}.json` with scenario config
2. App automatically discovers and renders in vertical selector
3. Deep-linking URL automatically works: `/demo/{vertical-id}`

### Adding a New Integration Guide
1. Create SVG diagram: `src/assets/diagrams/{platform-id}-architecture.svg`
2. Add entry to integration catalogue (static config or from API)
3. Automatically renders with architecture visualization

### Updating Capability Descriptions
1. Edit `src/assets/capability-registry.json`
2. No app rebuild required (if registry hosted on CDN)
3. Next app restart/reload picks up new descriptions

---

## Related Documents

- [ADR-0001: Capability Inventory Architecture](../../docs/adr/adr-0001-capability-inventory-architecture.md)
- [ADR-0002: Unified Capability Registry](../../docs/adr/adr-0002-unified-capability-registry.md)
- [ADR-0003: Client-Side Search](../../docs/adr/adr-0003-client-side-search.md)
- [ADR-0004: Setup Flow State Persistence](../../docs/adr/adr-0004-setup-flow-state-persistence.md)
- [ADR-0005: SVG Diagrams](../../docs/adr/adr-0005-svg-diagrams.md)
- [ADR-0006: Synthetic Data Demo Engine](../../docs/adr/adr-0006-synthetic-data-demo-engine.md)

---

## Approval & Review

| Role | Name | Status | Date |
|------|------|--------|------|
| Architecture Lead | TBD | Proposed | 2026-05-10 |
| Product Manager | TBD | Pending | |
| Engineering Lead | TBD | Pending | |

---

## Changelog

### v1.0 (2026-05-10)
- Initial unified architecture document
- Consolidated 6 individual ADRs
- Defined cross-feature architecture patterns
- Documented scalability and extensibility model
