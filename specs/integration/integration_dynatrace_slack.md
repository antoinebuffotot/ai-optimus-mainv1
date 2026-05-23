# Dynatrace Workflow Integration: Slack

## Overview

This document describes how to integrate Dynatrace Workflows with Slack to send automated notifications to channels or users when Dynatrace detects problems, anomalies, or other events.

---

## Prerequisites

- Dynatrace SaaS or Managed (version 1.260+)
- Slack workspace with admin rights (or permission to install apps)
- Dynatrace Workflow automation license

---

## Slack Configuration

### 1. Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) and click **Create New App > From scratch**.
2. Name the app (e.g., `Dynatrace Alerts`) and select your workspace.
3. Under **OAuth & Permissions**, add the following **Bot Token Scopes**:
   - `chat:write`
   - `chat:write.public`
   - `channels:read`
   - `users:read` *(optional, for DMs)*
4. Click **Install to Workspace** and authorize.
5. Copy the **Bot User OAuth Token** (`xoxb-...`).

### 2. Invite the Bot to a Channel

In Slack, open the target channel and run:

```
/invite @DynatraceAlerts
```

---

## Dynatrace Configuration

### 1. Create a Slack Connection

1. In Dynatrace, go to **Settings > Integrations > Slack**.
2. Click **Add connection** and fill in:
   - **Name**: `Slack Workspace`
   - **Bot Token**: paste the `xoxb-...` token
3. Click **Test connection** and **Save**.

### 2. Create a Workflow

1. Go to **Automations > Workflows > Create workflow**.
2. Select a trigger (e.g., **Problem**, **Custom event**, or **Schedule**).
3. Add a **Slack** action step.

### 3. Configure the Slack Action

| Action | Description |
|---|---|
| `Send message` | Posts a message to a channel or user |
| `Send direct message` | Sends a DM to a specific user |
| `Update message` | Edits a previously sent message (requires `ts`) |

#### Example: Problem Alert to Channel

```yaml
action: slack.send_message
parameters:
  connection: "Slack Workspace"
  channel: "#ops-alerts"
  text: |
    :red_circle: *Dynatrace Problem Detected*
    *Title:* {{ event.title }}
    *Severity:* {{ event.severityLevel }}
    *Impact:* {{ event.impactLevel }}
    *Affected:* {{ event.affectedEntities[0].name }}
    *Started:* {{ event.startTime }}
    <{{ event.url }}|View in Dynatrace>
```

#### Example: Resolution Notification

```yaml
action: slack.send_message
parameters:
  connection: "Slack Workspace"
  channel: "#ops-alerts"
  text: |
    :large_green_circle: *Dynatrace Problem Resolved*
    *Title:* {{ event.title }}
    *Problem ID:* {{ event.id }}
    *Duration:* {{ event.duration }}
    <{{ event.url }}|View in Dynatrace>
```

#### Example: Rich Block Kit Message

For a more structured notification using Slack Block Kit:

```yaml
action: slack.send_message
parameters:
  connection: "Slack Workspace"
  channel: "#ops-alerts"
  blocks:
    - type: header
      text:
        type: plain_text
        text: "🔴 Dynatrace Problem Detected"
    - type: section
      fields:
        - type: mrkdwn
          text: "*Title:*\n{{ event.title }}"
        - type: mrkdwn
          text: "*Severity:*\n{{ event.severityLevel }}"
        - type: mrkdwn
          text: "*Impact:*\n{{ event.impactLevel }}"
        - type: mrkdwn
          text: "*Affected Entity:*\n{{ event.affectedEntities[0].name }}"
    - type: actions
      elements:
        - type: button
          text:
            type: plain_text
            text: "View in Dynatrace"
          url: "{{ event.url }}"
          style: danger
```

---

## Workflow Variable Reference

| Variable | Description |
|---|---|
| `{{ event.id }}` | Dynatrace Problem ID |
| `{{ event.title }}` | Problem title |
| `{{ event.severityLevel }}` | Severity category |
| `{{ event.impactLevel }}` | Impact level |
| `{{ event.affectedEntities[0].name }}` | First affected entity name |
| `{{ event.url }}` | Deep-link to the Dynatrace problem |
| `{{ event.startTime }}` | Problem start time |
| `{{ event.duration }}` | Total problem duration (on close) |

---

## End-to-End Flow

```
Dynatrace Problem Event
        │
        ▼
  Workflow Triggered
        │
        ├─── Problem Opened ──► Slack #ops-alerts (red alert message)
        │
        └─── Problem Resolved ─► Slack #ops-alerts (green resolved message)
```

---

## Testing the Integration

1. Use **Simulate event** in the Workflow editor.
2. Confirm the message appears in the target Slack channel.
3. Check formatting, links, and variable substitution are correct.

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| `not_in_channel` error | Invite the bot to the target channel with `/invite` |
| `invalid_auth` error | Verify the Bot Token is correct and the app is installed |
| Message not formatted | Check Block Kit JSON syntax; use [Block Kit Builder](https://app.slack.com/block-kit-builder) |
| Variables showing raw | Ensure workflow trigger returns the expected event fields |

---

## References

- [Dynatrace Workflow Documentation](https://docs.dynatrace.com/docs/platform/workflows)
- [Slack API Documentation](https://api.slack.com/docs)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
