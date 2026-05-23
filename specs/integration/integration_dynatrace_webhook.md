# Dynatrace Workflow Integration: Generic Webhook

## Overview

This document describes how to use the **Generic Webhook** action in Dynatrace Workflows to send HTTP requests to any external system that exposes a REST API. This is the most flexible integration option and can be used when no native connector is available.

---

## Prerequisites

- Dynatrace SaaS or Managed (version 1.260+)
- A target endpoint that accepts HTTP requests (GET, POST, PUT, PATCH, DELETE)
- Dynatrace Workflow automation license

---

## When to Use a Generic Webhook

Use the generic webhook when:

- No native Dynatrace connector exists for your target tool
- You need full control over the HTTP request (headers, body, method)
- Integrating with internal/custom systems
- Calling third-party REST APIs directly (e.g., OpsGenie, Freshservice, custom ITSM)

---

## Dynatrace Configuration

### 1. (Optional) Create a Credential Vault Entry

For secure storage of API keys or tokens:

1. Go to **Settings > Integrations > Credential vault**.
2. Click **Add credentials** and choose the type:
   - **Username/Password** for Basic Auth
   - **Token** for Bearer or API key auth
3. Name it (e.g., `MyTool API Key`) and save.

### 2. Create a Workflow

1. Go to **Automations > Workflows > Create workflow**.
2. Choose your trigger (e.g., **Problem**, **Schedule**, **Custom event**).
3. Add an **HTTP request** action step.

### 3. Configure the HTTP Request Action

#### Basic POST Example

```yaml
action: http.request
parameters:
  method: POST
  url: "https://api.example.com/v1/incidents"
  headers:
    Content-Type: "application/json"
    Authorization: "Bearer {{ vault['MyTool API Key'].token }}"
    X-Source: "Dynatrace"
  body: |
    {
      "title": "{{ event.title }}",
      "severity": "{{ event.severityLevel }}",
      "impact": "{{ event.impactLevel }}",
      "affected_entity": "{{ event.affectedEntities[0].name }}",
      "problem_id": "{{ event.id }}",
      "start_time": "{{ event.startTime }}",
      "url": "{{ event.url }}",
      "source": "Dynatrace"
    }
```

#### GET Request with Query Parameters

```yaml
action: http.request
parameters:
  method: GET
  url: "https://api.example.com/v1/services/lookup"
  headers:
    Authorization: "Bearer {{ vault['MyTool API Key'].token }}"
  query_params:
    entity: "{{ event.affectedEntities[0].entityId }}"
    env: "production"
```

#### PUT Request (Update a Resource)

```yaml
action: http.request
parameters:
  method: PUT
  url: "https://api.example.com/v1/incidents/{{ steps.create_incident.output.id }}"
  headers:
    Content-Type: "application/json"
    Authorization: "Bearer {{ vault['MyTool API Key'].token }}"
  body: |
    {
      "status": "resolved",
      "resolved_at": "{{ event.endTime }}",
      "resolution_note": "Auto-resolved by Dynatrace Workflow"
    }
```

---

## Reading the HTTP Response

Use the response from a previous HTTP action step in subsequent steps:

```javascript
// Access response body (parsed as JSON)
const responseBody = execution.output['create_incident'];
const incidentId = responseBody.id;

// Access HTTP status code
const statusCode = execution.output['create_incident'].statusCode;

// Conditional logic based on response
if (statusCode >= 200 && statusCode < 300) {
  return { success: true, incident_id: incidentId };
} else {
  throw new Error(`API call failed with status ${statusCode}`);
}
```

---

## Authentication Patterns

### Bearer Token

```yaml
headers:
  Authorization: "Bearer {{ vault['MyAPIToken'].token }}"
```

### Basic Authentication

```yaml
headers:
  Authorization: "Basic {{ (vault['MyCredentials'].username + ':' + vault['MyCredentials'].password) | base64encode }}"
```

### API Key in Header

```yaml
headers:
  X-API-Key: "{{ vault['MyAPIKey'].token }}"
```

### API Key in Query String

```yaml
url: "https://api.example.com/endpoint?api_key={{ vault['MyAPIKey'].token }}"
```

### mTLS / Client Certificate

For mTLS, upload the certificate under **Settings > Integrations > Credential vault > Certificate** and reference it in the action.

---

## Workflow Variable Reference

| Variable | Description |
|---|---|
| `{{ event.id }}` | Dynatrace Problem ID |
| `{{ event.title }}` | Problem title |
| `{{ event.severityLevel }}` | Severity category |
| `{{ event.impactLevel }}` | Impact scope |
| `{{ event.affectedEntities }}` | Array of affected entities |
| `{{ event.affectedEntities[0].entityId }}` | Entity ID of the first affected entity |
| `{{ event.affectedEntities[0].name }}` | Name of the first affected entity |
| `{{ event.url }}` | Deep-link to the problem |
| `{{ event.startTime }}` | ISO 8601 start time |
| `{{ event.endTime }}` | ISO 8601 end time (on close) |
| `{{ vault['CredentialName'].token }}` | Secret from the credential vault |
| `{{ steps.<step_id>.output }}` | Output from a previous workflow step |

---

## Advanced Patterns

### Retry on Failure

Configure retries directly in the action settings:

```yaml
action: http.request
retry:
  max_attempts: 3
  wait_seconds: 10
  retry_on_status_codes:
    - 429    # Too Many Requests
    - 503    # Service Unavailable
```

### Chaining Multiple Webhook Calls

```
Step 1: POST /incidents          → Returns { "id": "INC-001" }
Step 2: POST /incidents/INC-001/comments  → Uses ID from Step 1
Step 3: PUT /incidents/INC-001   → Updates status
```

### Conditional Execution

Use a **Condition** step to skip the webhook if criteria aren't met:

```javascript
// Only call webhook if impact is APPLICATION level
return event.impactLevel === "APPLICATION";
```

---

## End-to-End Flow

```
Dynatrace Problem Event
        │
        ▼
  Workflow Triggered
        │
        ▼
  [Optional] Condition Check
        │
        ▼
  HTTP Request Action
  ┌──────────────────────────────────────┐
  │  POST https://api.example.com/...    │
  │  Headers: Authorization, Content-Type│
  │  Body: event details (JSON)          │
  └──────────────────────────────────────┘
        │
        ▼
  Read Response (status, body)
        │
        ▼
  [Optional] Follow-up actions
  (update, comment, notify)
```

---

## Testing the Integration

1. Use a tool like [webhook.site](https://webhook.site) as a temporary endpoint to inspect the raw payload.
2. Use **Simulate event** in the Workflow editor to fire a test event.
3. Inspect the request body in webhook.site and validate all variable substitutions.
4. Switch the URL to your production endpoint once validated.

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| `4xx` response from endpoint | Check URL, auth headers, and request body format |
| `401 Unauthorized` | Verify the credential vault entry and token scope |
| `SSL certificate error` | Ensure the endpoint uses a valid TLS cert, or configure custom CA |
| Variables not substituted | Confirm the trigger event provides the expected fields |
| Response body empty | Some APIs return `204 No Content`; handle gracefully in downstream steps |
| Workflow fails silently | Check **Automations > Executions** for error details |

---

## References

- [Dynatrace Workflow Documentation](https://docs.dynatrace.com/docs/platform/workflows)
- [Dynatrace Credential Vault](https://docs.dynatrace.com/docs/manage/credential-vault)
- [Webhook Testing Tool](https://webhook.site)
- [HTTP Status Codes Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
