---
title: "ADR-0002: Unified Capability Registry as Single Source of Truth"
status: "Proposed"
date: "2026-05-10"
authors: "Architecture Team"
tags: ["architecture", "data-model", "content-management"]
supersedes: ""
superseded_by: ""
---

# ADR-0002: Unified Capability Registry as Single Source of Truth

## Status

**Proposed** | Accepted | Rejected | Superseded | Deprecated

## Context

Multiple features (UC1, UC2, UC3) require metadata about AI capabilities: descriptions, categories, documentation links, use cases, and learning content. Each feature could maintain its own copy of capability definitions, leading to consistency issues, update complexity, and duplication. Alternatively, a single unified registry could serve all features, ensuring consistent taxonomy and reducing maintenance burden.

## Decision

Establish a **unified, versioned capability registry** stored as a JSON configuration file bundled with the app. This registry serves as the single source of truth for:
- Capability taxonomy (id, name, category, description)
- Documentation and configuration links
- Learning content metadata (use cases, learning path sequences)
- Integration relationships (which capabilities enable which integrations)

The registry is **decoupled from app releases**: updates to capability content, descriptions, or learning materials do not require app redeployment. The registry schema is versioned, allowing for backward-compatible evolution.

## Consequences

### Positive

- **POS-001**: Single source of truth eliminates inconsistencies between features; all views show aligned capability definitions
- **POS-002**: Content updates (descriptions, learning pages) can be deployed independently via registry versioning, not requiring app builds
- **POS-003**: Reduces bundle size by avoiding duplicated capability metadata across feature modules
- **POS-004**: Enables A/B testing of capability descriptions without code changes
- **POS-005**: Simplifies onboarding of new capabilities: add one registry entry, automatically surfaces in UC1, UC2, and UC3
- **POS-006**: Registry file can be tested independently for schema conformance and content quality
- **POS-007**: Enables third-party tools and content management systems to reference/validate capabilities against the registry

### Negative

- **NEG-001**: Single point of failure: if registry is corrupted or missing, all features degrade gracefully; must implement robust fallback
- **NEG-002**: Requires careful schema versioning discipline; breaking changes must be explicitly handled and communicated
- **NEG-003**: Registry size grows linearly with capability count; must avoid bloating initial bundle load
- **NEG-004**: Tight coupling between registry schema and app code; schema changes ripple across multiple features
- **NEG-005**: Manual maintenance overhead: adding a new capability requires registry entry, linking to documentation, and content review

## Alternatives Considered

### Alternative 1: Per-Feature Capability Definitions

- **ALT-001**: **Description**: Each feature (UC1, UC2, UC3) maintains its own capability configuration file with only the fields it needs
- **ALT-002**: **Rejection Reason**: Duplicates capability metadata across features; inconsistencies when descriptions or links change; higher maintenance burden; difficult to add new features that reference existing capabilities

### Alternative 2: Fetch Registry from Remote API on App Load

- **ALT-003**: **Description**: Load capability registry from a dynamic endpoint (e.g., content CDN) at runtime instead of bundling with app
- **ALT-004**: **Rejection Reason**: Adds network latency and dependency on external service availability; complicates offline usage; requires additional error handling for network failures; less suitable for a Dynatrace AppEngine app with predictable deployment patterns

### Alternative 3: Store Registry in Dynatrace Document Service

- **ALT-005**: **Description**: Maintain capability definitions in Dynatrace Document Service; app fetches at runtime via API
- **ALT-006**: **Rejection Reason**: Adds API call overhead on every page render; requires additional scopes and permissions; makes registry updates require Dynatrace environment access; harder to version and test in isolation

## Implementation Notes

- **IMP-001**: Define registry schema with TypeScript interface:
  ```typescript
  interface CapabilityRegistry {
    version: string;
    capabilities: {
      id: string;
      name: string;
      category: string;
      description: string;
      useCases: string[];
      docUrl: string;
      videoUrl?: string;
      relatedCapabilityIds: string[];
    }[];
  }
  ```
- **IMP-002**: Store registry file at `src/assets/capability-registry.json` (or similar); include in production bundle
- **IMP-003**: Implement `CapabilityRegistry` TypeScript interface and export utility functions: `getCapability(id)`, `getCapabilitiesByCategory(category)`, `getRelatedCapabilities(id)`
- **IMP-004**: Validate registry schema at build time using JSON Schema or TypeScript validation
- **IMP-005**: Document registry schema in `docs/registry-schema.md` with examples and changelog for schema versions
- **IMP-006**: Implement fallback: if registry fails to load, show error UI with guidance to refresh; never silently degrade
- **IMP-007**: Registry updates follow semantic versioning: major version for schema breaking changes, minor for content additions, patch for corrections
- **IMP-008**: Establish review process for registry changes: content review by product team, schema changes reviewed by architecture team

## References

- **REF-001**: ADR-0001 (Capability Inventory Architecture) — consumes registry for capability metadata
- **REF-002**: UC2 (AI Capabilities Usage Overview) — uses registry for capability cards
- **REF-003**: UC3 (Capability Learning Hub) — uses registry for learning content metadata
- **REF-004**: JSON Schema specification for schema validation
