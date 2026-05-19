# Dynatrace AI Observability – Complete Guide

> Sources:
> - https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/get-started/openllmetry *(Updated: Feb 25, 2026)*
> - https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/sample-use-cases/data-governance *(Updated: Dec 10, 2025)*

This guide covers two complementary topics for AI Observability with Dynatrace:

1. **Implementing OpenLLMetry** — instrument AI/LLM applications to send traces and metrics to Dynatrace.
2. **AI Data Governance with Amazon Bedrock** — comply with AI regulatory record-keeping requirements (e.g. EU AI Act) by retaining AI events long-term.

---

## Table of Contents

- [Part 1 – Implementing OpenLLMetry](#part-1--implementing-openllmetry)
  - [Who Is This For?](#who-is-this-for)
  - [Prerequisites](#prerequisites)
  - [Why OpenLLMetry?](#why-openllmetry)
  - [Step 1 – Instrument Your Application](#step-1--instrument-your-application)
  - [Step 2 – Configure Your Application](#step-2--configure-your-application)
  - [Step 3 – Set Up Sampling (Optional)](#step-3--set-up-sampling-optional)
  - [Step 4 – Execute Your AI Model](#step-4--execute-your-ai-model)
  - [Step 5 – Observe in Dynatrace](#step-5--observe-in-dynatrace)
- [Part 2 – AI Data Governance with Amazon Bedrock](#part-2--ai-data-governance-with-amazon-bedrock)
  - [What You Will Learn](#what-you-will-learn)
  - [Step 1 – Configure Dynatrace](#step-1--configure-dynatrace)
  - [Step 2 – Configure Your AWS Account](#step-2--configure-your-aws-account)
  - [Step 3 – Configure Your Application](#step-3--configure-your-application-1)
- [Related Resources](#related-resources)

---

## Part 1 – Implementing OpenLLMetry

OpenLLMetry captures and transmits AI model/agent KPIs to Dynatrace, providing insights into LLM metrics, spans, and logs in the context of all traces and code-level information.

### Who Is This For?

- AI engineering teams building agent- and LLM-powered applications.
- Site Reliability Engineers monitoring AI workloads on hyperscalers.
- Platform engineers integrating OTel data from AI apps into Dynatrace.

---

### Prerequisites

- A running AI app (or AI demo app).
- Dynatrace SaaS with a **Dynatrace Platform Subscription (DPS)** license with the following capabilities enabled:
  - Traces powered by Grail
  - Metrics powered by Grail
  - Log Analytics
- OTLP ingestion enabled (see [OpenTelemetry and Dynatrace](https://docs.dynatrace.com/docs/ingest-from/opentelemetry)).
- An OpenAI platform API key.
- A Dynatrace API token with the following scopes:
  - `metrics.ingest` — Ingest metrics
  - `logs.ingest` — Ingest logs
  - `openTelemetryTrace.ingest` — Ingest OpenTelemetry traces

**Helpful prior knowledge:**
- Python or Node.js
- OTel concepts: SDKs, spans, exporters, collectors
- Dynatrace permissions and data ingestion

---

### Why OpenLLMetry?

Standard OpenTelemetry auto-instrumentation captures spans and basic resource attributes, but doesn't collect AI-specific KPIs such as model name, version, prompt/completion tokens, or temperature parameters. OpenLLMetry bridges this gap by supporting popular AI frameworks (OpenAI, HuggingFace, Pinecone, LangChain) and standardizing the collection of model KPIs through OpenTelemetry.

---

### Step 1 – Instrument Your Application

> ⚠️ OpenLLMetry for **Node.js does not currently support metrics**.

#### Python

**1. Install the OpenLLMetry SDK:**

```bash
pip install traceloop-sdk
```

**2. Initialize the tracer** at the beginning of your main file:

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
- `<YOUR_ENV>` — your Dynatrace environment ID
- `<YOUR_DT_API_TOKEN>` — your Dynatrace API token
- `<your-service>` — your application name

**3. Add framework annotations** as needed (e.g. `@workflow`, `@task`, `@agent`, `@tool`).  
See [OpenLLMetry for Python docs](https://www.traceloop.com/docs/openllmetry/getting-started-python) for details.

---

#### Node.js

**1. Install the required packages:**

```bash
npm i @opentelemetry/exporter-trace-otlp-proto @traceloop/node-server-sdk
```

**2. Initialize the tracer** at the beginning of your main file:

```javascript
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import * as traceloop from "@traceloop/node-server-sdk";

const exporter = new OTLPTraceExporter({
    url: "https://<YOUR_ENV>.live.dynatrace.com/api/v2/otlp",
    headers: { Authorization: "Api-Token <YOUR_DT_API_TOKEN>" },
});

traceloop.initialize({
    appName: "<your-service>",
    exporter: exporter
});
```

Replace the placeholders:
- `<YOUR_ENV>` — your Dynatrace environment ID
- `<YOUR_DT_API_TOKEN>` — your Dynatrace API token
- `<your-service>` — your application name

---

### Step 2 – Configure Your Application

Below is a complete Python example using OpenAI + LangChain that generates a short executive summary of a company's business purpose.

```python
import os
import openai
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from traceloop.sdk import Traceloop
from traceloop.sdk.decorators import workflow, task

os.environ['OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE'] = "delta"

headers = { "Authorization": "Api-Token <YOUR_DT_API_TOKEN>" }

Traceloop.init(
    app_name="<your-service>",
    api_endpoint="https://<YOUR_ENV>.live.dynatrace.com/api/v2/otlp",
    headers=headers,
    disable_batch=True
)

openai.api_key = os.getenv("OPENAI_API_KEY")

@task(name="add_prompt_context")
def add_prompt_context():
    prompt = ChatPromptTemplate.from_template(
        "explain the business of company {company} in a max of {length} words"
    )
    model = ChatOpenAI()
    chain = prompt | model
    return chain

@task(name="prep_prompt_chain")
def prep_prompt_chain():
    return add_prompt_context()

@workflow(name="ask_question")
def prompt_question():
    chain = prep_prompt_chain()
    return chain.invoke({"company": "dynatrace", "length": 50})

if __name__ == "__main__":
    print(prompt_question())
```

---

### Step 3 – Set Up Sampling (Optional)

You can point the OTLP endpoint to an OpenTelemetry Collector or any ActiveGate endpoint instead of sending directly to Dynatrace.

For details, see the [OpenTelemetry Sampling documentation](https://opentelemetry.io/docs/concepts/sampling/#collector).

---

### Step 4 – Execute Your AI Model

Run the application:

```bash
python chaining.py
```

OpenLLMetry will export traces to your Dynatrace OTLP endpoint and print the LLM response to the terminal.

---

### Step 5 – Observe in Dynatrace

1. In Dynatrace, navigate to **Distributed Tracing**.
2. Search for the `ask_question` workflow.
3. Inspect the captured spans, which automatically include:
   - The LangChain model used (e.g. `gpt-4o-mini`)
   - The temperature parameter
   - Completion token count per request
   - Other relevant metadata

---

## Part 2 – AI Data Governance with Amazon Bedrock

When running AI models through Amazon Bedrock, Dynatrace helps comply with regulatory record-keeping requirements such as the [EU AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai).

### What You Will Learn

- Configure Dynatrace for long-term AI event retention
- Set up AWS to forward Amazon Bedrock events to Dynatrace
- Instrument your application with the Dynatrace fork of OpenLLMetry

---

### Step 1 – Configure Dynatrace

#### 1a. Create a Dynatrace API Token

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

#### 1b. Create a Custom Grail Bucket (Extended Retention)

The default BizEvents retention period is 35 days, which may not satisfy regulatory requirements. To extend it:

1. Go to **Settings** > **Storage management** > **Bucket storage management**.
2. Select **+ Bucket**.
3. Configure the new bucket:
   - **Bucket name**: e.g. `gen_ai_events`
   - **Retention period (in days)**: e.g. `1825` (≈ 5 years)
   - **Bucket table type**: `bizevents`
4. Select **Save**.

---

#### 1c. Configure OpenPipeline to Route AI Events

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
4. Drag the new route to the **first row** in the table so it triggers first.

---

### Step 2 – Configure Your AWS Account

Amazon Bedrock emits events for every configuration action (e.g. model deployment, fine-tuning completion). Forward these to Dynatrace via Amazon EventBridge:

1. Follow the [EventBridge to Dynatrace BizEvent integration guide](https://github.com/dynatrace-oss/cloud-snippets/tree/main/aws/eventbridge-events-to-dynatrace#ingest-as-bizevents) to set up the forwarding rule.
2. In the [`InputTemplate` field](https://github.com/dynatrace-oss/cloud-snippets/blob/8785beb90e9d5c53de4f8420bf5e68b6ac673a09/aws/eventbridge-events-to-dynatrace/biz-events.yaml#L115), set the `"type"` property to:

   ```
   gen_ai.auditing
   ```

   > This value must match the condition used in the OpenPipeline dynamic route configured in Step 1c.

---

### Step 3 – Configure Your Application

Instrument your application using the Dynatrace fork of OpenLLMetry to collect traces and metrics from AI workloads.

> ⚠️ **Alpha Notice**: The libraries used here are currently in alpha (`0.0.1a4`). They may contain bugs or undergo significant changes. Use at your own risk. Report issues on the [GitHub issues page](https://github.com/dynatrace-oss).

**Install the SDK:**

```bash
pip install -i https://test.pypi.org/simple/ dynatrace-openllmetry-sdk==0.0.1a4
```

**Initialize the tracer** at the beginning of your main file:

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

Once both parts are configured, you can:

- Track AI models in real time and examine their model attributes.
- Assess reliability and latency of each LangChain task.
- Fetch all user/AI interactions, training status, and deployment events on demand.
- Use **Notebooks** or **Dashboards** in Dynatrace to build custom analytics and compliance reports.
- Retain AI governance data for 5+ years to satisfy regulatory requirements such as the EU AI Act.
- Explore the [AI Observability app](https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/ai-observability-app) to visualize all AI workloads end-to-end.

---

## Related Resources

- [OpenTelemetry and Dynatrace](https://docs.dynatrace.com/docs/ingest-from/opentelemetry)
- [OTLP API Base URLs](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/otlp-api#base-url)
- [OpenLLMetry Python Getting Started](https://www.traceloop.com/docs/openllmetry/getting-started-python)
- [OpenPipeline Documentation](https://docs.dynatrace.com/docs/platform/openpipeline)
- [EventBridge to Dynatrace BizEvent integration](https://github.com/dynatrace-oss/cloud-snippets/tree/main/aws/eventbridge-events-to-dynatrace#ingest-as-bizevents)
- [AI Observability App](https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/ai-observability-app)
- [Dynatrace API Authentication](https://docs.dynatrace.com/docs/dynatrace-api/basics/dynatrace-api-authentication)
- [Sample AI agent instrumentation examples](https://github.com/dynatrace-oss/dynatrace-ai-agent-instrumentation-examples)
- [EU AI Act Overview](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
