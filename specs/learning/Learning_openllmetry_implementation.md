# Implementing OpenLLMetry with Dynatrace AI Observability

> Source: https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/get-started/openllmetry  
> Updated: Feb 25, 2026

OpenLLMetry captures and transmits AI model/agent KPIs to Dynatrace, providing insights into LLM metrics, spans, and logs in the context of all traces and code-level information.

---

## Who Is This For?

- AI engineering teams building agent- and LLM-powered applications.
- Site Reliability Engineers monitoring AI workloads on hyperscalers.
- Platform engineers integrating OTel data from AI apps into Dynatrace.

---

## Prerequisites

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

### Prior Knowledge

Helpful to have basic familiarity with:
- Python or Node.js
- OTel concepts: SDKs, spans, exporters, collectors
- Dynatrace permissions and data ingestion

---

## Why OpenLLMetry?

Standard OpenTelemetry auto-instrumentation captures spans and basic resource attributes, but doesn't collect AI-specific KPIs such as model name, version, prompt/completion tokens, or temperature parameters. OpenLLMetry bridges this gap by supporting popular AI frameworks (OpenAI, HuggingFace, Pinecone, LangChain) and standardizing the collection of model KPIs through OpenTelemetry.

---

## Step 1 – Instrument Your Application

> ⚠️ OpenLLMetry for **Node.js does not currently support metrics**.

### Python

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

### Node.js

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

## Step 2 – Configure Your Application

Below is a complete Python example using OpenAI + LangChain. It builds an LLM that generates a short executive summary of a company's business purpose.

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

## Step 3 – Set Up Sampling (Optional)

You can point the OTLP endpoint to an OpenTelemetry Collector or any ActiveGate endpoint instead of sending directly to Dynatrace.

For details, see the [OpenTelemetry Sampling documentation](https://opentelemetry.io/docs/concepts/sampling/#collector).

---

## Step 4 – Execute Your AI Model

Run the application:

```bash
python chaining.py
```

Expected output: OpenLLMetry will export traces to your Dynatrace OTLP endpoint and the LLM response will be printed to the terminal.

---

## Step 5 – Observe in Dynatrace

1. In Dynatrace, navigate to **Distributed Tracing**.
2. Search for the `ask_question` workflow.
3. Inspect the captured spans, which will automatically include:
   - The LangChain model used (e.g. `gpt-4o-mini`)
   - The temperature parameter
   - Completion token count for each request
   - Other relevant metadata

---

## Next Steps

- Explore the [AI Observability app](https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/ai-observability-app) to visualize AI workloads.
- Review [sample applications](https://github.com/dynatrace-oss/dynatrace-ai-agent-instrumentation-examples) for more integration examples.
- Point OTLP to a Collector or ActiveGate endpoint for advanced pipeline setups.

---

## Related Resources

- [OpenTelemetry and Dynatrace](https://docs.dynatrace.com/docs/ingest-from/opentelemetry)
- [Dynatrace API Authentication](https://docs.dynatrace.com/docs/dynatrace-api/basics/dynatrace-api-authentication)
- [OTLP API Base URLs](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/otlp-api#base-url)
- [OpenLLMetry Python Getting Started](https://www.traceloop.com/docs/openllmetry/getting-started-python)
