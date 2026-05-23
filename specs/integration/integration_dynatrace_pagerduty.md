# Dynatrace Workflow Integration: PagerDuty

## Overview

This document describes how to integrate Dynatrace Workflows with PagerDuty to automatically trigger, acknowledge, and resolve PagerDuty incidents based on Dynatrace problem lifecycle events.

---

## Prerequisites

- Dynatrace SaaS or Managed (version 1.260+)
- PagerDuty account with service admin access
- Dynatrace Workflow automation license

---

## PagerDuty Configuration

### 1. Create an Integration on a PagerDuty Service

1. In PagerDuty, go to **Services > Service Directory**.
2. Select your target service (or create a new one).
3. Go to the **Integrations** tab and click **Add an integration**.
4. Search for **Dynatrace** or use **Events API v2**.
5. Click **Add** and copy the **Integration Key** (routing key).

### 2. (Optional) Create a Dedicated Service

For better noise isolation, create a dedicated PagerDuty service for Dynatrace alerts:

1. **Services > Service Directory > New Service**.
2. Name it `Dynatrace Monitoring`.
3. Assign an escalation policy.
4. Add the **Events API v2** integration and note the integration key.

---

## Dynatrace Configuration

### 1. Create a PagerDuty Connection

1. In Dynatrace, go to **Settings > Integrations > PagerDuty**.
2. Click **Add connection** and fill in:
   - **Name**: `PagerDuty Production`
   - **Integration Key**: key from PagerDuty
   - **API Token** *(optional, for advanced operations)*: PagerDuty API key from **User settings > API Access**
3. Click **Test connection** and **Save**.

### 2. Create a Workflow

1. Go to **Automations > Workflows > Create workflow**.
2. Set the trigger to **Problem** events.
3. Use branching logic to handle open vs. resolved events.

### 3. Configure PagerDuty Actions

#### Example: Trigger Incident (Problem Opened)

```yaml
action: pagerduty.trigger_incident
parameters:
  connection: "PagerDuty Production"
  routing_key: "{{ connection.integration_key }}"
  dedup_key: "dynatrace-{{ event.id }}"    # Prevents duplicate incidents
  summary: "{{ event.title }}"
  severity: "critical"                      # critical | error | warning | info
  source: "Dynatrace"
  component: "{{ event.affectedEntities[0].name }}"
  group: "{{ event.impactLevel }}"
  custom_details:
    problem_id: "{{ event.id }}"
    severity_level: "{{ event.severityLevel }}"
    impact_level: "{{ event.impactLevel }}"
    affected_entity: "{{ event.affectedEntities[0].name }}"
    dynatrace_url: "{{ event.url }}"
    start_time: "{{ event.startTime }}"
  links:
    - href: "{{ event.url }}"
      text: "View Problem in Dynatrace"
```

#### Example: Resolve Incident (Problem Closed)

```yaml
action: pagerduty.resolve_incident
parameters:
  connection: "PagerDuty Production"
  routing_key: "{{ connection.integration_key }}"
  dedup_key: "dynatrace-{{ event.id }}"    # Must match the trigger dedup_key
  summary: "Dynatrace problem {{ event.id }} resolved automatically."
```

#### Example: Acknowledge Incident

```yaml
action: pagerduty.acknowledge_incident
parameters:
  connection: "PagerDuty Production"
  routing_key: "{{ connection.integration_key }}"
  dedup_key: "dynatrace-{{ event.id }}"
```

---

## Severity Mapping

Map Dynatrace severity levels to PagerDuty severities:

| Dynatrace Severity | PagerDuty Severity |
|---|---|
| `AVAILABILITY` | `critical` |
| `PERFORMANCE` | `error` |
| `ERROR` | `error` |
| `RESOURCE_CONTENTION` | `warning` |
| `CUSTOM_ALERT` | `info` |
| `MONITORING_UNAVAILABLE` | `critical` |

You can implement this mapping with a conditional expression in the workflow:

```javascript
// Dynatrace JavaScript expression
const severityMap = {
  "AVAILABILITY": "critical",
  "PERFORMANCE": "error",
  "ERROR": "error",
  "RESOURCE_CONTENTION": "warning",
  "CUSTOM_ALERT": "info"
};
return severityMap[event.severityLevel] || "error";
```

---

## Workflow Variable Reference

| Variable | Description |
|---|---|
| `{{ event.id }}` | Dynatrace Problem ID (use as `dedup_key`) |
| `{{ event.title }}` | Problem title |
| `{{ event.severityLevel }}` | Severity category |
| `{{ event.impactLevel }}` | Impact scope |
| `{{ event.affectedEntities[0].name }}` | First affected entity |
| `{{ event.url }}` | Deep-link to the problem |
| `{{ event.startTime }}` | Problem start time |
| `{{ event.duration }}` | Duration (available on close) |

---

## End-to-End Flow

```
Dynatrace Problem Opened
        │
        ▼
  Workflow Triggered
        │
        ▼
  PagerDuty: Trigger Incident
  (dedup_key = dynatrace-{{ event.id }})
        │
        ▼
  On-call engineer notified
        │
  [Problem Resolved in Dynatrace]
        │
        ▼
  Workflow Triggered (close event)
        │
        ▼
  PagerDuty: Resolve Incident
  (matched by same dedup_key)
```

---

## Testing the Integration

1. Simulate a Dynatrace problem or use **Simulate event** in the Workflow editor.
2. Confirm a new incident appears in PagerDuty with the correct severity and details.
3. Resolve the Dynatrace problem and verify the PagerDuty incident auto-resolves.

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| Incident not created | Verify the integration key is from Events API v2, not v1 |
| Duplicate incidents triggered | Ensure `dedup_key` is consistent across trigger and resolve steps |
| Resolve event not matching | Confirm `dedup_key` in the resolve action matches the trigger exactly |
| Wrong severity in PagerDuty | Implement the severity mapping expression above |
| API token errors | Ensure the PagerDuty API token has `incidents:write` scope |

---

## References

- [Dynatrace Workflow Documentation](https://docs.dynatrace.com/docs/platform/workflows)
- [PagerDuty Events API v2](https://developer.pagerduty.com/docs/events-api-v2/overview/)
- [PagerDuty Deduplication](https://support.pagerduty.com/docs/event-management#deduplication)
