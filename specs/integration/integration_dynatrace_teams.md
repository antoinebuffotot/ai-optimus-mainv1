# Dynatrace Workflow Integration: Microsoft Teams

## Overview

This document describes how to integrate Dynatrace Workflows with Microsoft Teams to send automated notifications to Teams channels when Dynatrace detects problems or anomalies.

---

## Prerequisites

- Dynatrace SaaS or Managed (version 1.260+)
- Microsoft Teams workspace with admin or team owner access
- Dynatrace Workflow automation license

---

## Microsoft Teams Configuration

### Option A: Incoming Webhook (Recommended for Simplicity)

1. In Microsoft Teams, open the target channel.
2. Click **···** (More options) next to the channel name > **Connectors**.
3. Search for **Incoming Webhook** and click **Configure**.
4. Name it `Dynatrace Alerts`, optionally upload an icon, and click **Create**.
5. Copy the **Webhook URL** provided.

> **Note:** As of late 2024, Microsoft is phasing out Office 365 Connectors in favor of Workflows (Power Automate). If Incoming Webhook is unavailable in your tenant, use **Option B** below.

### Option B: Power Automate Flow (Modern Approach)

1. Go to [https://make.powerautomate.com](https://make.powerautomate.com).
2. Create a new flow: **Instant cloud flow > When an HTTP request is received**.
3. Add a **Post message in a chat or channel** Teams action.
4. Save the flow and copy the generated **HTTP POST URL**.

---

## Dynatrace Configuration

### 1. Create a Microsoft Teams Connection

1. In Dynatrace, go to **Settings > Integrations > Microsoft Teams**.
2. Click **Add connection** and fill in:
   - **Name**: `Teams Operations Channel`
   - **Webhook URL**: URL from Option A or B above
3. Click **Test connection** and **Save**.

### 2. Create a Workflow

1. Go to **Automations > Workflows > Create workflow**.
2. Choose a trigger (e.g., **Problem opened**, **Problem resolved**).
3. Add a **Microsoft Teams** action step.

### 3. Configure the Teams Action

#### Example: Problem Alert (Adaptive Card)

```yaml
action: msteams.send_message
parameters:
  connection: "Teams Operations Channel"
  message:
    type: AdaptiveCard
    version: "1.4"
    body:
      - type: TextBlock
        text: "🔴 Dynatrace Problem Detected"
        size: Large
        weight: Bolder
        color: Attention
      - type: FactSet
        facts:
          - title: "Title"
            value: "{{ event.title }}"
          - title: "Severity"
            value: "{{ event.severityLevel }}"
          - title: "Impact"
            value: "{{ event.impactLevel }}"
          - title: "Affected Entity"
            value: "{{ event.affectedEntities[0].name }}"
          - title: "Start Time"
            value: "{{ event.startTime }}"
    actions:
      - type: Action.OpenUrl
        title: "View in Dynatrace"
        url: "{{ event.url }}"
```

#### Example: Simple Text Message (Problem Resolved)

```yaml
action: msteams.send_message
parameters:
  connection: "Teams Operations Channel"
  text: |
    ✅ **Dynatrace Problem Resolved**
    **Title:** {{ event.title }}
    **Problem ID:** {{ event.id }}
    **Duration:** {{ event.duration }}
    [View in Dynatrace]({{ event.url }})
```

---

## Workflow Variable Reference

| Variable | Description |
|---|---|
| `{{ event.id }}` | Dynatrace Problem ID |
| `{{ event.title }}` | Problem title |
| `{{ event.severityLevel }}` | Severity category |
| `{{ event.impactLevel }}` | Impact scope |
| `{{ event.affectedEntities[0].name }}` | First affected entity |
| `{{ event.url }}` | Deep-link to the problem |
| `{{ event.startTime }}` | Problem start time (ISO 8601) |
| `{{ event.duration }}` | Problem duration (on close) |

---

## End-to-End Flow

```
Dynatrace Problem Event
        │
        ▼
  Workflow Triggered
        │
        ├─── Problem Opened ──► Teams Channel (Adaptive Card alert)
        │
        └─── Problem Resolved ─► Teams Channel (resolution message)
```

---

## Testing the Integration

1. In the Workflow editor, click **Simulate event**.
2. Verify the Adaptive Card or text message appears in the correct Teams channel.
3. Click the **View in Dynatrace** button to confirm the link resolves correctly.

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| Webhook URL returns 410 Gone | Office 365 Connector deprecated; migrate to Power Automate |
| Message not delivered | Check that the Webhook URL is still valid and not expired |
| Adaptive Card not rendered | Validate the card schema at [Adaptive Cards Designer](https://adaptivecards.io/designer/) |
| Variables not substituted | Verify the trigger event type includes the expected fields |
| Test passes but live events fail | Check workflow execution log under **Automations > Executions** |

---

## References

- [Dynatrace Workflow Documentation](https://docs.dynatrace.com/docs/platform/workflows)
- [Microsoft Teams Incoming Webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Power Automate HTTP Trigger](https://learn.microsoft.com/en-us/power-automate/workflow-trigger-http)
