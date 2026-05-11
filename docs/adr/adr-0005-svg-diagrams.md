---
title: "ADR-0005: SVG Diagrams for Scalable Integration Architecture Visualization"
status: "Proposed"
date: "2026-05-10"
authors: "Architecture Team"
tags: ["architecture", "content", "accessibility", "visualization"]
supersedes: ""
superseded_by: ""
---

# ADR-0005: SVG Diagrams for Scalable Integration Architecture Visualization

## Status

**Proposed** | Accepted | Rejected | Superseded | Deprecated

## Context

The MCP ITSM Integration Explorer (UC5) displays architecture diagrams for each integration pattern (ServiceNow, Jira, Slack, etc.) to help users understand data flow and configuration requirements. Architecture diagrams could be stored as:
- **Raster images** (PNG, JPEG): simple, but quality degrades on high-DPI displays, large file sizes for complex diagrams
- **Vector graphics** (SVG): scalable, smaller file sizes, accessible text content, interactive potential
- **Embedded React diagrams**: code-based, flexible, but adds bundle size and complexity
- **External service** (Miro, Lucidchart): rich editing but requires network calls and external dependencies

SVG offers the best balance of accessibility, scalability, bundle impact, and editing experience.

## Decision

Store all integration architecture diagrams as **SVG assets** with the following constraints:
1. **No rasterized images**: diagrams are pure vector (SVG code), not embedded PNGs or screenshots
2. **Semantic markup**: SVG includes descriptive `<title>`, `<desc>`, and ARIA labels for accessibility
3. **Bundle location**: diagrams stored in `src/assets/diagrams/` as individual `.svg` files
4. **Styling**: diagrams use CSS classes (not inline styles) to allow theming and dark-mode support
5. **Alt text**: each diagram referenced in content includes descriptive alt text or ARIA labels

Diagrams are maintained separately from content metadata; the integration catalogue references diagrams by filename. This decouples diagram updates from app releases and enables independent diagram versioning.

## Consequences

### Positive

- **POS-001**: SVG scales infinitely without quality loss; looks crisp on all device resolutions and zoom levels
- **POS-002**: SVG file sizes are typically 2–5x smaller than equivalent PNG for technical diagrams
- **POS-003**: SVG content is text-based, searchable, and accessible to screen readers with proper ARIA labels
- **POS-004**: Can style diagrams with CSS for light/dark mode themes without maintaining separate image variants
- **POS-005**: SVG can be animated (future enhancement) without additional tooling or formats
- **POS-006**: Easy to version control: SVG is text-based, diffs are human-readable
- **POS-007**: Reduces deployment complexity: diagrams do not require separate image optimization pipeline

### Negative

- **NEG-001**: Creating and maintaining SVG diagrams requires different tooling than raster images; designers may have steeper learning curve
- **NEG-002**: SVG with complex gradients, filters, or effects can become large and performance-heavy to render
- **NEG-003**: Browser support for older SVG features (filters, mask) may be limited; must test across target browsers
- **NEG-004**: Interactive SVG (animations, click handlers) requires additional JavaScript, increasing bundle size if overused
- **NEG-005**: Embedding SVG in React can be cumbersome; requires either `import` as component or `<img>` tag, each with trade-offs

## Alternatives Considered

### Alternative 1: PNG/JPEG Raster Images

- **ALT-001**: **Description**: Store architecture diagrams as PNG or JPEG files; familiar to designers, simple tooling
- **ALT-002**: **Rejection Reason**: Raster images scale poorly on high-DPI displays (blurry); large file sizes for technical diagrams; creates accessibility issues (image alt text is separate from image); requires multiple variants for dark mode; harder to update (regenerate from design tool)

### Alternative 2: Embedded React Diagram Component

- **ALT-003**: **Description**: Build diagrams as React components using libraries like Recharts or Visx; fully interactive and themeable
- **ALT-004**: **Rejection Reason**: Adds significant JavaScript bundle size; over-engineered for static diagrams; more complex to maintain; slower initial render; more suitable for interactive/dynamic diagrams than static reference architecture

### Alternative 3: External Diagram Service (Miro, Lucidchart Embed)

- **ALT-005**: **Description**: Host diagrams on external platform and embed via iframe
- **ALT-006**: **Rejection Reason**: Adds external dependency and network call; security risk if external service is compromised; diagrams not accessible offline; poor performance in low-bandwidth environments; licensing and cost concerns

## Implementation Notes

- **IMP-001**: Create SVG structure with semantic markup:
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="diagram-title">
    <title id="diagram-title">ServiceNow Integration Architecture</title>
    <desc>Data flow diagram showing Dynatrace → MCP → ServiceNow incident sync</desc>
    <!-- diagram content -->
  </svg>
  ```
- **IMP-002**: Style diagrams with CSS classes for theming; import global theme CSS in pages that render diagrams
- **IMP-003**: Store diagrams in `src/assets/diagrams/` with naming convention: `{integration-id}-architecture.svg` (e.g., `servicenow-architecture.svg`)
- **IMP-004**: Reference diagrams in integration catalogue JSON: `architectureDiagramUrl: "/diagrams/servicenow-architecture.svg"`
- **IMP-005**: Render SVG using `<img>` tag (simpler, sandboxed) or dynamic import if interactivity needed; avoid inline SVG in content for maintainability
- **IMP-006**: Include detailed alt text or ARIA description for each diagram; test with screen readers (NVDA, JAWS)
- **IMP-007**: Validate SVG syntax at build time using SVG validators; catch malformed or inaccessible SVG before deployment
- **IMP-008**: Create SVG template/guide for designers with standardized colors, fonts, and layout patterns for consistency across diagrams
- **IMP-009**: Optimize SVG files: remove unnecessary namespaces, group related elements, use `<use>` for repeated elements if applicable

## References

- **REF-001**: UC5 (MCP ITSM Integration Explorer) specification — defines architecture diagram requirement
- **REF-002**: W3C SVG Specification and SVG Best Practices
- **REF-003**: WCAG 2.1 guidelines for accessible images and diagrams
- **REF-004**: MDN Web Docs — SVG in HTML and accessibility
