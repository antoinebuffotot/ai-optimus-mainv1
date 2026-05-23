# Dynatrace Workflow Integration: Jira

## Overview

This document describes how to integrate Dynatrace Workflows with Jira (Cloud or Data Center) to automatically create and manage issues based on Dynatrace problem events.

---

## Prerequisites

- Dynatrace SaaS or Managed (version 1.260+)
- Jira Cloud or Jira Data Center instance
- Jira account with project admin rights
- Dynatrace Workflow automation license

---

## Jira Configuration

### 1. Generate an API Token (Jira Cloud)

1. Log in to [Atlassian Account](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Click **Create API token**, name it `Dynatrace Workflow`, and copy the token.

> For **Jira Data Center**, use a Personal Access Token (PAT) generated under **Profile > Personal Access Tokens**.

### 2. Identify Your Project Details

Note the following for your target project:

- **Project Key** (e.g., `OPS`)
- **Issue Type** (e.g., `Bug`, `Incident`, `Task`)
- **Board ID** (if using Scrum/Kanban)

---

## Dynatrace Configuration

### 1. Create a Jira Connection

1. In Dynatrace, go to **Settings > Integrations > Jira**.
2. Click **Add connection** and fill in:
   - **Name**: `Jira Cloud Production`
   - **Base URL**: `https://<your-org>.atlassian.net` (Cloud) or your Data Center URL
   - **Username / Email**: your Jira account email
   - **API Token / PAT**: token from the previous step
3. Click **Test connection** and **Save**.

### 2. Create a Workflow

1. Go to **Automations > Workflows > Create workflow**.
2. Set the trigger to **Problem** event.
3. Configure filters as needed (e.g., severity, entity type).

### 3. Add a Jira Action

Add a Jira action step and configure it:

| Action | Description |
|---|---|
| `Create issue` | Opens a new Jira issue |
| `Update issue` | Modifies fields on an existing issue |
| `Transition issue` | Moves an issue through workflow states |
| `Add comment` | Appends a comment to an existing issue |

#### Example: Create Issue

```yaml
action: jira.create_issue
parameters:
  connection: "Jira Cloud Production"
  project_key: "OPS"
  issue_type: "Incident"
  summary: "[Dynatrace] {{ event.title }}"
  description: |
    *Problem Details*
    - *Problem ID:* {{ event.id }}
    - *Severity:* {{ event.severityLevel }}
    - *Impact:* {{ event.impactLevel }}
    - *Affected Entity:* {{ event.affectedEntities[0].name }}
    - *Start Time:* {{ event.startTime }}
    - *Dynatrace URL:* {{ event.url }}
  priority: "High"
  labels:
    - "dynatrace"
    - "auto-created"
  assignee: "ops-team-lead@example.com"
```

#### Example: Transition Issue to Done (on Problem Close)

```yaml
action: jira.transition_issue
parameters:
  connection: "Jira Cloud Production"
  issue_key: "{{ execution.output['create_issue'].key }}"
  transition: "Done"
  comment: "Dynatrace problem {{ event.id }} has been resolved. Closing automatically."
```

---

## Storing the Issue Key Across Steps

To link the "create" and "close" steps, store the issue key from the creation step and reference it in subsequent steps:

```yaml
# Step 1 — Create issue, store result
- id: create_issue
  action: jira.create_issue
  ...

# Step 2 — Transition on resolve (separate workflow or condition branch)
- id: close_issue
  action: jira.transition_issue
  parameters:
    issue_key: "{{ steps.create_issue.output.key }}"
```

> **Tip:** Use Dynatrace problem ID (`event.id`) as a custom field or label in Jira to look up existing issues reliably in subsequent workflows.

---

## Workflow Variable Reference

| Variable | Description |
|---|---|
| `{{ event.id }}` | Dynatrace Problem ID |
| `{{ event.title }}` | Problem title |
| `{{ event.severityLevel }}` | AVAILABILITY / PERFORMANCE / ERROR / RESOURCE |
| `{{ event.impactLevel }}` | APPLICATION / SERVICE / INFRASTRUCTURE |
| `{{ event.affectedEntities[0].name }}` | Name of the first affected entity |
| `{{ event.url }}` | Deep-link to the problem in Dynatrace |
| `{{ event.startTime }}` | ISO 8601 problem start time |

---

## End-to-End Flow

```
Dynatrace Problem Opened
        │
        ▼
  Workflow Triggered
        │
        ▼
  ┌──────────────────────────┐
  │  Create Jira Issue (OPS) │
  │  Returns issue key       │
  └──────────────────────────┘
        │
  [Problem Resolved]
        │
        ▼
  Workflow Triggered (close)
        │
        ▼
  ┌──────────────────────────┐
  │  Transition Issue → Done │
  │  + Add resolution comment│
  └──────────────────────────┘
```

---

## Testing the Integration

1. Use **Simulate event** in the Workflow editor or trigger a real Dynatrace problem.
2. Confirm the Jira issue is created with the correct fields.
3. Resolve the problem in Dynatrace and verify the Jira issue transitions to the expected state.

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| 401 Unauthorized | Verify API token is correct and not expired |
| Project not found | Check the project key is exact and the user has access |
| Issue type invalid | Confirm issue type name matches exactly (case-sensitive) |
| Transition fails | Ensure the issue is in a state that allows the target transition |
| Fields rejected | Check required fields for the project's issue creation screen |

---

## References

- [Dynatrace Workflow Documentation](https://docs.dynatrace.com/docs/platform/workflows)
- [Jira Cloud REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Jira Data Center REST API](https://developer.atlassian.com/server/jira/platform/rest-apis/)
