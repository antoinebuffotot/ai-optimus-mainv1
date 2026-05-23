# Dynatrace Workflow Integration: ServiceNow

## Overview

This document describes how to integrate Dynatrace Workflows with ServiceNow to automatically create, update, and resolve incidents or change requests based on Dynatrace problem events.

---

## Prerequisites

- Dynatrace SaaS or Managed environment (version 1.260+)
- ServiceNow instance with admin access
- A dedicated ServiceNow service account for API access
- Dynatrace Workflow automation license

---

## ServiceNow Configuration

### 1. Create a Service Account

1. In ServiceNow, navigate to **User Administration > Users**.
2. Create a new user (e.g., `dynatrace-integration`).
3. Assign the following roles:
   - `itil`
   - `rest_service`
4. Note the username and password for later use.

### 2. Enable REST API Access

Ensure the **REST API** plugin is active:

- Navigate to **System Definition > Plugins**.
- Search for `com.glide.rest` and confirm it is active.

---

## Dynatrace Configuration

### 1. Create a ServiceNow Connection

1. In Dynatrace, go to **Settings > Integrations > ServiceNow**.
2. Click **Add connection** and fill in:
   - **Name**: `ServiceNow Production`
   - **Instance URL**: `https://<your-instance>.service-now.com`
   - **Username**: service account username
   - **Password**: service account password
3. Click **Test connection** and then **Save**.

### 2. Create a Workflow

1. Navigate to **Automations > Workflows**.
2. Click **Create workflow** and choose **Problem trigger**.
3. Configure the trigger:
   - **Event type**: Problem opened / Problem closed
   - **Filter** (optional): e.g., `event.category == "AVAILABILITY"`

### 3. Add a ServiceNow Action

Within the workflow, add a new action step:

1. Select **ServiceNow** from the action catalog.
2. Choose one of the available action types:

| Action | Description |
|---|---|
| `Create Incident` | Opens a new incident in ServiceNow |
| `Update Incident` | Updates an existing incident |
| `Resolve Incident` | Closes an incident when the problem is resolved |
| `Create Change Request` | Opens a change request |

#### Example: Create Incident

```yaml
action: servicenow.create_incident
parameters:
  connection: "ServiceNow Production"
  short_description: "{{ event.title }}"
  description: |
    Problem ID: {{ event.id }}
    Severity: {{ event.severityLevel }}
    Affected Entity: {{ event.affectedEntities[0].name }}
    Impact: {{ event.impactLevel }}
    URL: {{ event.url }}
  urgency: "2"        # 1=High, 2=Medium, 3=Low
  impact: "2"
  category: "software"
  assignment_group: "IT Operations"
```

#### Example: Resolve Incident (on Problem Close)

```yaml
action: servicenow.update_incident
parameters:
  connection: "ServiceNow Production"
  sys_id: "{{ execution.output['create_incident'].sys_id }}"
  state: "6"          # 6 = Resolved
  close_code: "Solved (Permanently)"
  close_notes: "Dynatrace problem {{ event.id }} resolved automatically."
```

---

## Workflow Variable Reference

| Variable | Description |
|---|---|
| `{{ event.id }}` | Dynatrace Problem ID |
| `{{ event.title }}` | Problem title |
| `{{ event.severityLevel }}` | Severity (e.g., AVAILABILITY, PERFORMANCE) |
| `{{ event.impactLevel }}` | Impact level (APPLICATION, SERVICE, INFRASTRUCTURE) |
| `{{ event.affectedEntities }}` | List of affected Dynatrace entities |
| `{{ event.url }}` | Link to the problem in Dynatrace |
| `{{ event.startTime }}` | Problem start timestamp |

---

## End-to-End Flow

```
Dynatrace Problem Detected
        │
        ▼
  Workflow Triggered
        │
        ▼
  ServiceNow Action
  ┌─────────────────────────────────┐
  │  Create Incident in ServiceNow  │
  │  (with problem details)         │
  └─────────────────────────────────┘
        │
  [Problem Resolved]
        │
        ▼
  Workflow Triggered (close event)
        │
        ▼
  ┌─────────────────────────────────┐
  │  Update & Resolve Incident      │
  └─────────────────────────────────┘
```

---

## Testing the Integration

1. Manually trigger a problem in Dynatrace (via **Settings > Anomaly detection**) or use the **Simulate event** option in Workflows.
2. Confirm that a new incident appears in ServiceNow.
3. Resolve the Dynatrace problem and verify the ServiceNow incident is updated accordingly.

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| Connection test fails | Verify instance URL, credentials, and network firewall rules |
| Incident not created | Check workflow execution logs under **Automations > Executions** |
| Fields missing in ServiceNow | Ensure the service account has `itil` role and field-level permissions |
| Duplicate incidents | Add a condition to check if a problem is already mapped to an existing incident |

---

## References

- [Dynatrace Workflow Documentation](https://docs.dynatrace.com/docs/platform/workflows)
- [ServiceNow REST API Reference](https://docs.servicenow.com/bundle/washingtondc-api-reference/page/integrate/inbound-rest/concept/c_RESTAPI.html)
