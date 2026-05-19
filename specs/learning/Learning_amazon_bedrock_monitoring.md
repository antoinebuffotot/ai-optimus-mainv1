# AI Data Governance with Amazon Bedrock & Dynatrace

> Source: https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/sample-use-cases/data-governance  
> Updated: Dec 10, 2025

This tutorial walks through configuring Dynatrace to help comply with AI regulatory record-keeping requirements (such as the EU AI Act) when running AI models through Amazon Bedrock. It covers both model training/deployment observability and user inference request observability.

---

## What You Will Learn

- Configure Dynatrace for long-term AI event retention
- Set up AWS to forward Amazon Bedrock events to Dynatrace
- Instrument your application with OpenLLMetry for AI observability

---

## Overview

| Step | Description |
|---|---|
| Step 1 | Configure Dynatrace (token + OpenPipeline) |
| Step 2 | Configure your AWS account to send data to Dynatrace |
| Step 3 | Configure your application with OpenLLMetry |

---

## Step 1 – Configure Dynatrace

### 1a. Create a Dynatrace API Token

1. In Dynatrace, press `CTRL+K` and search for **Access Tokens**.
2. Select **Generate new token**.
3. Enter a **Token name**.
4. Add the following permission scopes:
   - `bizevents.ingest` — Ingest bizevents
   - `metrics.ingest` — Ingest metrics
   - `logs.ingest` — Ingest logs
   - `events.ingest` — Ingest events
   - `openTelemetryTrace.ingest` — Ingest OpenTelemetry traces
5. Select **Generate token**.
6. Copy and store the token securely (e.g. in a password manager).

> ⚠️ You can only view the token once upon creation. It cannot be revealed afterward.

---

### 1b. Create a Custom Grail Bucket (Extended Retention)

The default BizEvents retention period is 35 days, which may not satisfy regulatory requirements. To extend it:

1. Go to **Settings** > **Storage management** > **Bucket storage management**.
2. Select **+ Bucket**.
3. Configure the new bucket:
   - **Bucket name**: e.g. `gen_ai_events`
   - **Retention period (in days)**: e.g. `1825` (≈ 5 years)
   - **Bucket table type**: `bizevents`
4. Select **Save**.

---

### 1c. Configure OpenPipeline to Route AI Events

Once the bucket is available, create a pipeline to redirect AI-relevant events to it.

**Create the pipeline:**

1. Go to **Settings** > **Process and contextualize** > **OpenPipeline** > **Business events** > **Pipelines**.
2. Select **+ Pipeline** and name it (e.g. `AI Data Governance`).
3. On the **Storage** tab, select **+ Processor** > **Bucket assignment**.
4. Configure the processor:
   - **Name**: any descriptive name
   - **Matching condition**: `true`
   - **Storage**: select the bucket created in Step 1b
5. Select **Save**.

**Add dynamic routing:**

1. Still in **OpenPipeline** > **Business events**, go to the **Dynamic routing** tab.
2. Select **+ Dynamic route** and configure it:
   - **Name**: e.g. `AI Event Routing`
   - **Matching condition**: `matchesValue(event.type,"gen_ai.auditing")`
   - **Pipeline**: select the pipeline created above
3. Select **Add**, then **Save**.
4. Drag the new route to the **first row** in the table so it is triggered first.

---

## Step 2 – Configure Your AWS Account

Amazon Bedrock emits events for every configuration action (e.g. model deployment, fine-tuning completion). You can forward these to Dynatrace via Amazon EventBridge.

1. Follow the [EventBridge to Dynatrace BizEvent integration guide](https://github.com/dynatrace-oss/cloud-snippets/tree/main/aws/eventbridge-events-to-dynatrace#ingest-as-bizevents) to set up the forwarding rule.
2. In the [`InputTemplate` field](https://github.com/dynatrace-oss/cloud-snippets/blob/8785beb90e9d5c53de4f8420bf5e68b6ac673a09/aws/eventbridge-events-to-dynatrace/biz-events.yaml#L115), set the `"type"` property to:

   ```
   gen_ai.auditing
   ```

   > This value must match the condition used in the OpenPipeline dynamic route configured in Step 1c.

---

## Step 3 – Configure Your Application

Instrument your application using the Dynatrace fork of OpenLLMetry to collect traces and metrics from AI workloads.

> ⚠️ **Alpha Notice**: The libraries used here are currently in alpha (`0.0.1a4`). They may contain bugs or undergo significant changes. Use at your own risk. Report issues on the [GitHub issues page](https://github.com/dynatrace-oss).

### Install the SDK

```bash
pip install -i https://test.pypi.org/simple/ dynatrace-openllmetry-sdk==0.0.1a4
```

### Initialize the Tracer

Add the following code at the beginning of your main file:

```python
from traceloop.sdk import Traceloop

headers = { "Authorization": "Api-Token <YOUR_DT_API_TOKEN>" }

Traceloop.init(
    app_name="<your-service>",
    api_endpoint="https://<YOUR_ENV>.live.dynatrace.com/api/v2/otlp",
    headers=headers
)
```

Replace the placeholders:
- `<YOUR_DT_API_TOKEN>` — the token generated in Step 1a
- `<YOUR_ENV>` — your Dynatrace environment ID
- `<your-service>` — your application name

---

## What You Can Do Now

Once all three steps are complete, you can:

- Fetch all user/AI interactions, training status, and deployment events on demand.
- Use **Notebooks** or **Dashboards** in Dynatrace to build custom analytics and compliance reports.
- Retain AI governance data for 5+ years to satisfy regulatory requirements such as the EU AI Act.

---

## Related Resources

- [OpenPipeline Documentation](https://docs.dynatrace.com/docs/platform/openpipeline)
- [EventBridge to Dynatrace BizEvent integration](https://github.com/dynatrace-oss/cloud-snippets/tree/main/aws/eventbridge-events-to-dynatrace#ingest-as-bizevents)
- [AI Observability App](https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/ai-observability-app)
- [Dynatrace API Authentication](https://docs.dynatrace.com/docs/dynatrace-api/basics/dynatrace-api-authentication)
- [EU AI Act Overview](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
