export type LearningCodeLanguage =
  | "bash"
  | "json"
  | "yaml"
  | "javascript"
  | "typescript"
  | "python"
  | "dql";

export interface LearningStep {
  id: string;
  title: string;
  body: string;
  code?: { language?: LearningCodeLanguage; content: string };
  link?: { label: string; href: string };
}

export interface LearningPrerequisite {
  id: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
}

export interface LearningStepGroup {
  id: string;
  title: string;
  /** First index into the flat `steps` array that belongs to this group (inclusive). */
  startIndex: number;
}

export interface LearningContent {
  capabilityId: string;
  overview: string;
  prerequisites: LearningPrerequisite[];
  steps: LearningStep[];
  /**
   * Optional split of the flat `steps` array into labelled sub-sections. When
   * omitted, the renderer shows a single "Steps" group. Groups MUST be ordered
   * by ascending `startIndex` and the first one MUST start at 0.
   */
  stepGroups?: LearningStepGroup[];
}

export const learningContent: LearningContent[] = [
  {
    capabilityId: "ai-workflows",
    overview:
      "An agentic workflow is a Dynatrace workflow that uses at least one Dynatrace Intelligence action. It can range from summarising a problem in natural language to chained pipelines that evaluate data, score it, and trigger remediation.",
    prerequisites: [
      {
        id: "license",
        title: "Dynatrace Intelligence access",
        body: "Your tenant must have Dynatrace Intelligence enabled, and you need permission to create workflows.",
      },
      {
        id: "workflows-app",
        title: "Workflows app installed",
        body: "The Workflows app must be installed and reachable from your Dynatrace environment.",
        link: {
          label: "Workflows overview",
          href: "https://docs.dynatrace.com/docs/analyze-explore-automate/workflows",
        },
      },
      {
        id: "ai-actions",
        title: "Dynatrace Intelligence actions",
        body: "Familiarise yourself with prompt actions, data queries and code actions — these are the building blocks of an agentic workflow.",
      },
    ],
    steps: [
      {
        id: "open-workflows",
        title: "Open the Workflows app",
        body: "Open the Workflows section in Dynatrace from the launcher.",
      },
      {
        id: "create-workflow",
        title: "Select Create workflow",
        body: "From the Workflows landing page, click 'Create workflow' to open the template dialog.",
      },
      {
        id: "pick-template",
        title: "Choose an agentic workflow template",
        body: "Pick one of the ready-to-use agentic templates (Alert Reduction, Kubernetes Troubleshooting, Threat Triage, Vulnerability Verification, etc.).",
      },
      {
        id: "configure",
        title: "Instantiate and configure",
        body: "Adjust prompts, data sources, and downstream actions to match your use case. You can chain multiple prompt actions and mix in data queries or code actions.",
      },
      {
        id: "run-validate",
        title: "Run and validate",
        body: "Execute the workflow against real data and confirm the AI-driven outputs (summaries, scores, remediation) are sensible before enabling triggers.",
      },
    ],
  },
  {
    capabilityId: "dtctl",
    overview:
      "dtctl is a kubectl-inspired CLI for managing Dynatrace platform resources (workflows, dashboards, DQL queries, SLOs and more) directly from your terminal.",
    prerequisites: [
      {
        id: "env-url",
        title: "Dynatrace environment URL",
        body: "You need the URL of your Dynatrace environment, e.g. https://abc12345.apps.dynatrace.com.",
      },
      {
        id: "api-token",
        title: "Dynatrace API token",
        body: "Generate an API token with the scopes listed in the dtctl token scopes documentation.",
        link: {
          label: "Token scopes",
          href: "https://github.com/dynatrace-oss/dtctl/blob/main/docs/TOKEN_SCOPES.md",
        },
      },
      {
        id: "go-optional",
        title: "Go toolchain (only for source build)",
        body: "Only required if you want to build dtctl from source. The recommended path is downloading a pre-built release.",
      },
    ],
    steps: [
      {
        id: "install-binary",
        title: "Install the dtctl binary",
        body: "Download the latest release for your platform and place it on your PATH.",
        code: {
          language: "bash",
          content:
            "mv dtctl /usr/local/bin/dtctl\nchmod +x /usr/local/bin/dtctl",
        },
        link: {
          label: "Latest releases",
          href: "https://github.com/dynatrace-oss/dtctl/releases/latest",
        },
      },
      {
        id: "set-context",
        title: "Set a context",
        body: "A context links a name to your Dynatrace environment URL and a token reference.",
        code: {
          language: "bash",
          content:
            'dtctl config set-context my-env \\\n  --environment "https://abc12345.apps.dynatrace.com" \\\n  --token-ref my-token',
        },
      },
      {
        id: "set-credentials",
        title: "Set credentials",
        body: "Store your Dynatrace API token under the reference name used in the context.",
        code: {
          language: "bash",
          content: 'dtctl config set-credentials my-token --token "dt0s16.YOUR_TOKEN"',
        },
      },
      {
        id: "verify",
        title: "Verify the setup",
        body: "Confirm that dtctl can reach your environment.",
        code: { language: "bash", content: "dtctl get workflows" },
      },
      {
        id: "agent-skill",
        title: "Install the AI Agent Skill (optional)",
        body: "Copy the bundled Agent Skill into your AI assistant's skills folder so it knows how to use dtctl.",
        code: {
          language: "bash",
          content:
            "# For Claude Code\ncp -r skills/dtctl ~/.claude/skills/\n\n# For GitHub Copilot\ncp -r skills/dtctl ~/.github/skills/",
        },
      },
    ],
  },
  {
    capabilityId: "mcp-server",
    overview:
      "The Dynatrace MCP (Model Context Protocol) server hosts tools that external agents — GitHub Copilot in VS Code, Claude Desktop and others — can call to query Dynatrace data, run DQL, investigate problems and analyse Kubernetes events.",
    prerequisites: [
      {
        id: "env-name",
        title: "Dynatrace environment",
        body: "Know your {environment-name}. The MCP URL is https://{environment-name}.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp.",
      },
      {
        id: "platform-token",
        title: "Platform Token (recommended)",
        body: "Generate a Platform Token. OAuth client tokens are accepted but expire after 5 minutes and are not supported for direct remote MCP connections.",
        link: {
          label: "Platform Tokens docs",
          href: "https://docs.dynatrace.com/docs/manage/identity-access-management/access-tokens-and-oauth-clients/platform-tokens",
        },
      },
      {
        id: "permissions",
        title: "MCP permissions",
        body: "Both the user and the token need mcp-gateway:servers:invoke and mcp-gateway:servers:read.",
      },
      {
        id: "vscode",
        title: "VS Code with Copilot Chat",
        body: "Install VS Code with GitHub Copilot Chat — that's where the MCP server is wired in.",
      },
    ],
    steps: [
      {
        id: "prepare-token",
        title: "Prepare a Bearer token",
        body: "Generate a Platform Token scoped to your user permissions. Keep it handy — you'll paste it into the VS Code config next.",
      },
      {
        id: "open-mcp-json",
        title: "Create .vscode/mcp.json",
        body: "In your workspace, create or open .vscode/mcp.json.",
      },
      {
        id: "add-config",
        title: "Add the MCP server config",
        body: "Paste the Dynatrace MCP server entry, replacing {environment-name} and YOUR_BEARER_TOKEN_HERE.",
        code: {
          language: "json",
          content:
            '{\n  "servers": {\n    "dynatrace-mcp": {\n      "url": "https://{environment-name}.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",\n      "headers": {\n        "Authorization": "Bearer YOUR_BEARER_TOKEN_HERE"\n      }\n    }\n  }\n}',
        },
      },
      {
        id: "start-server",
        title: "Start the server",
        body: "Save the file and click Start above the server name in VS Code. Note: VS Code does not auto-refresh expired tokens — regenerate manually when they expire.",
      },
      {
        id: "verify",
        title: "Verify in Copilot Chat",
        body: "Open Copilot Chat, press Ctrl+# to pick contexts, select Tools → dynatrace-mcp (All tools), then ask: 'Show me last 10 logs'. A response from the Dynatrace MCP server confirms the setup.",
      },
    ],
  },
  {
    capabilityId: "ai-observability",
    overview:
      "End-to-end observability for AI/LLM applications via OpenLLMetry — capturing model name, prompt/completion tokens, temperature, latency and other AI-specific KPIs. Optionally retain AI events long-term for regulatory record-keeping (e.g. EU AI Act) with the Amazon Bedrock data-governance pattern.",
    stepGroups: [
      {
        id: "openllmetry-implementation",
        title: "Part 1 — OpenLLMetry implementation",
        startIndex: 0,
      },
      {
        id: "amazon-bedrock-monitoring",
        title: "Part 2 — Amazon Bedrock monitoring (AI data governance)",
        startIndex: 8,
      },
    ],
    prerequisites: [
      {
        id: "ai-app",
        title: "A running AI application",
        body: "Have an AI app (or a demo app) ready to instrument — typically Python or Node.js using OpenAI, LangChain, HuggingFace, Pinecone, etc.",
      },
      {
        id: "dps-license",
        title: "Dynatrace Platform Subscription with Grail",
        body: "Dynatrace SaaS with a DPS license and the following enabled: Traces powered by Grail, Metrics powered by Grail, and Log Analytics.",
      },
      {
        id: "otlp-ingest",
        title: "OTLP ingestion enabled",
        body: "OTLP ingestion must be turned on for your tenant.",
        link: {
          label: "OpenTelemetry and Dynatrace",
          href: "https://docs.dynatrace.com/docs/ingest-from/opentelemetry",
        },
      },
      {
        id: "openai-key",
        title: "OpenAI platform API key",
        body: "An OpenAI API key for the model you want to instrument and trace.",
      },
      {
        id: "dt-token",
        title: "Dynatrace API token with the right scopes",
        body: "Generate a token with metrics.ingest, logs.ingest and openTelemetryTrace.ingest. For the AI Data Governance flow also add bizevents.ingest and events.ingest.",
        link: {
          label: "Dynatrace API authentication",
          href: "https://docs.dynatrace.com/docs/dynatrace-api/basics/dynatrace-api-authentication",
        },
      },
      {
        id: "prior-knowledge",
        title: "Helpful prior knowledge",
        body: "Familiarity with Python or Node.js, OpenTelemetry concepts (SDKs, spans, exporters, collectors) and Dynatrace permissions / data ingestion.",
      },
    ],
    steps: [
      {
        id: "install-sdk-python",
        title: "Install the OpenLLMetry SDK (Python)",
        body: "OpenLLMetry standardises collection of AI-specific KPIs (model, tokens, temperature) on top of OpenTelemetry. Install the Traceloop SDK in your Python environment.",
        code: { language: "bash", content: "pip install traceloop-sdk" },
        link: {
          label: "OpenLLMetry Python docs",
          href: "https://www.traceloop.com/docs/openllmetry/getting-started-python",
        },
      },
      {
        id: "init-tracer-python",
        title: "Initialise the tracer (Python)",
        body: "Call Traceloop.init() at the start of your main file, pointing api_endpoint to your Dynatrace OTLP endpoint and authenticating with the API token.",
        code: {
          language: "python",
          content:
            // eslint-disable-next-line noSecrets/no-secrets
            'from traceloop.sdk import Traceloop\n\nheaders = { "Authorization": "Api-Token <YOUR_DT_API_TOKEN>" }\n\nTraceloop.init(\n    app_name="<your-service>",\n    api_endpoint="https://<YOUR_ENV>.live.dynatrace.com/api/v2/otlp",\n    headers=headers\n)',
        },
      },
      {
        id: "install-sdk-node",
        title: "Install the OpenLLMetry SDK (Node.js)",
        body: "For Node.js, install the OTLP HTTP/proto exporter together with the Traceloop server SDK. Note: OpenLLMetry for Node.js does not currently support metrics — only traces.",
        code: {
          language: "bash",
          content:
            "npm i @opentelemetry/exporter-trace-otlp-proto @traceloop/node-server-sdk",
        },
      },
      {
        id: "init-tracer-node",
        title: "Initialise the tracer (Node.js)",
        body: "Configure an OTLP trace exporter targeting Dynatrace and pass it into traceloop.initialize().",
        code: {
          language: "javascript",
          content:
            'import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";\nimport * as traceloop from "@traceloop/node-server-sdk";\n\nconst exporter = new OTLPTraceExporter({\n    url: "https://<YOUR_ENV>.live.dynatrace.com/api/v2/otlp",\n    headers: { Authorization: "Api-Token <YOUR_DT_API_TOKEN>" },\n});\n\ntraceloop.initialize({\n    appName: "<your-service>",\n    exporter: exporter\n});',
        },
      },
      {
        id: "annotate-code",
        title: "Annotate workflows, tasks, agents and tools",
        body: "Decorate functions with @workflow, @task, @agent and @tool (Python) — or the equivalent helpers in Node.js — so OpenLLMetry can attribute spans correctly.",
        code: {
          language: "python",
          content:
            // eslint-disable-next-line noSecrets/no-secrets
            'import os\nimport openai\nfrom langchain.chat_models import ChatOpenAI\nfrom langchain.prompts import ChatPromptTemplate\nfrom traceloop.sdk import Traceloop\nfrom traceloop.sdk.decorators import workflow, task\n\nos.environ[\'OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE\'] = "delta"\n\nTraceloop.init(\n    app_name="<your-service>",\n    api_endpoint="https://<YOUR_ENV>.live.dynatrace.com/api/v2/otlp",\n    headers={ "Authorization": "Api-Token <YOUR_DT_API_TOKEN>" },\n    disable_batch=True,\n)\n\n@task(name="add_prompt_context")\ndef add_prompt_context():\n    prompt = ChatPromptTemplate.from_template(\n        "explain the business of company {company} in a max of {length} words"\n    )\n    model = ChatOpenAI()\n    return prompt | model\n\n@workflow(name="ask_question")\ndef prompt_question():\n    chain = add_prompt_context()\n    return chain.invoke({"company": "dynatrace", "length": 50})',
        },
      },
      {
        id: "sampling",
        title: "Set up sampling (optional)",
        body: "Point the OTLP endpoint at an OpenTelemetry Collector or ActiveGate to centralise sampling, batching and resource attribution before forwarding to Dynatrace.",
        link: {
          label: "OpenTelemetry sampling",
          href: "https://opentelemetry.io/docs/concepts/sampling/#collector",
        },
      },
      {
        id: "execute-model",
        title: "Execute your AI model",
        body: "Run the application — OpenLLMetry exports spans (and metrics on Python) to your Dynatrace OTLP endpoint while the LLM response prints to the terminal.",
        code: { language: "bash", content: "python chaining.py" },
      },
      {
        id: "observe-dynatrace",
        title: "Observe in Dynatrace",
        body: "Open Distributed Tracing in Dynatrace and search for your workflow (e.g. ask_question). Spans automatically include the LangChain model used, temperature, completion token counts and other metadata.",
        link: {
          label: "AI Observability app",
          href: "https://docs.dynatrace.com/docs/observe/dynatrace-for-ai-observability/ai-observability-app",
        },
      },
      {
        id: "governance-token",
        title: "Data governance — create an extended API token",
        body: "For Amazon Bedrock data governance, generate a token with the scopes bizevents.ingest, metrics.ingest, logs.ingest, events.ingest and openTelemetryTrace.ingest. Store it securely — it can only be revealed once.",
      },
      {
        id: "governance-bucket",
        title: "Data governance — create a long-retention Grail bucket",
        body: "Default BizEvents retention is 35 days. Under Settings > Storage management > Bucket storage management, create a new bizevents bucket (e.g. gen_ai_events) with a 1825-day (~5 year) retention period to satisfy EU AI Act-style requirements.",
      },
      {
        id: "governance-openpipeline",
        title: "Data governance — route AI events via OpenPipeline",
        body: "In Settings > Process and contextualize > OpenPipeline > Business events, create a pipeline (e.g. 'AI Data Governance') with a Bucket assignment processor pointing at your gen_ai_events bucket. Then add a Dynamic route matching matchesValue(event.type,\"gen_ai.auditing\") and move it to the first row so it triggers first.",
        code: {
          language: "dql",
          content: 'matchesValue(event.type, "gen_ai.auditing")',
        },
      },
      {
        id: "governance-eventbridge",
        title: "Data governance — forward Amazon Bedrock events via EventBridge",
        body: "Follow the EventBridge → Dynatrace BizEvent integration guide. In the InputTemplate, set the type property to gen_ai.auditing so it matches the OpenPipeline dynamic route.",
        link: {
          label: "EventBridge to Dynatrace BizEvent integration",
          href: "https://github.com/dynatrace-oss/cloud-snippets/tree/main/aws/eventbridge-events-to-dynatrace#ingest-as-bizevents",
        },
      },
      {
        id: "governance-app-sdk",
        title: "Data governance — instrument with the Dynatrace OpenLLMetry fork",
        body: "Install the Dynatrace fork of the OpenLLMetry SDK (currently alpha) and initialise Traceloop the same way as above to capture AI workload traces and metrics into your governance bucket.",
        code: {
          language: "bash",
          content:
            "pip install -i https://test.pypi.org/simple/ dynatrace-openllmetry-sdk==0.0.1a4",
        },
      },
    ],
  },
  {
    capabilityId: "davis-assist",
    overview:
      "Predefined, contextual Dynatrace Assist prompts are embedded in many Dynatrace apps (Kubernetes, Vulnerabilities, Threats & Exploits, Security Posture Management, Databases, Problems, Dashboards, Notebooks). Trigger them with a single click to get AI-powered explanations and remediation suggestions.",
    prerequisites: [
      {
        id: "enable-genai",
        title: "Enable generative AI at the environment level",
        body: "Go to Settings > Dynatrace Intelligence > Generative and agentic AI > Enable generative AI. From Dynatrace 1.335+ it's on by default for new tenants; older tenants must enable it manually.",
      },
      {
        id: "user-permissions",
        title: "Generative AI user permissions",
        body: "Users must have the required generative AI user permissions if you are not relying on the Dynatrace default policies.",
        link: {
          label: "Davis Copilot user permissions",
          href: "https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/agentic-and-generative-ai-getting-started#davis-copilot-user-permissions",
        },
      },
      {
        id: "recommender-skill",
        title: "Access to the conversational recommender skill",
        body: "Embedded conversation starters depend on the conversational recommender skill — make sure your tenant has access to it.",
      },
    ],
    steps: [
      {
        id: "kubernetes",
        title: "Use Assist in Kubernetes",
        body: "Open the Kubernetes app, navigate to a list page (Clusters, Nodes, Namespaces or Workloads), pick a warning signal and choose 'Explain warning signal'. Dynatrace Assist opens and auto-executes a prompt that returns a general explanation, typical root causes (most common first), and common remediation steps.",
      },
      {
        id: "vulnerabilities",
        title: "Use Assist in Vulnerabilities",
        body: "In Vulnerabilities, open a finding and select 'Explain vulnerability' in the upper-right corner. The response covers the underlying cause, potential impact and exploit conditions, affected libraries/services/code locations, relevant entry points and recommended remediation actions.",
      },
      {
        id: "threats-exploits",
        title: "Use Assist in Threats & Exploits",
        body: "Open a finding in Threats & Exploits and select 'Explain finding'. The plain-language response covers the threat, its impact and likelihood, affected entities and attack paths, contributing indicators and recommended actions.",
      },
      {
        id: "spm",
        title: "Use Assist in Security Posture Management",
        body: "In Security Posture Management, open Assessment results, pick a rule, switch to the Assessed resources tab and select 'Explain assessment'. The response covers the intent of the rule, the failing configuration values, security/operational risks and recommended remediation.",
      },
      {
        id: "databases",
        title: "Use Assist in Databases",
        body: "In Databases > Explorer, click the statement performance icon on the rightmost column, expand a statement (request an execution plan if needed), open the Execution plan tab and click 'Summarize execution plan'. Assist returns a natural-language summary of how the database runs the query, performance details and recommendations.",
      },
      {
        id: "problems-single",
        title: "Use Assist in Problems (single)",
        body: "Open any problem detail page and click 'Explain' in the upper-right corner. Assist auto-executes a prompt covering what happened, why it happened, and actionable remediation steps.",
      },
      {
        id: "problems-multiple",
        title: "Use Assist in Problems (multiple, up to 5)",
        body: "On the Problems list page, select up to 5 problems and click 'Explain' above the table. The response explains each problem, its cause, remediation steps, and any relationships identified between them.",
      },
      {
        id: "dashboards",
        title: "Embed Assist in a Dashboard tile",
        body: "On an editable dashboard, edit a DQL tile and append the prompt + execute fields. Remove the execute line if you want users to review the prompt before running it. Note: this does not work for queries using makeTimeseries.",
        code: {
          language: "dql",
          content:
            '| fieldsAdd prompt = concat("{your question}", your.field.name)\n| fieldsAdd execute = true',
        },
      },
      {
        id: "dashboards-context",
        title: "Add supplementary context to a Dashboard prompt (optional)",
        body: "Provide hidden context to help Assist give more accurate answers, either statically or dynamically based on a field value.",
        code: {
          language: "dql",
          content:
            '| fieldsAdd supplementaryContext = concat("{\\"result\\":[{\\"type\\":\\"supplementary\\", \\"value\\":\\"Use the following info to answer the question: ", record.summary, "\\"}]}")\n| parse supplementaryContext, "LD JSON_ARRAY:contexts"',
        },
      },
      {
        id: "notebooks",
        title: "Embed Assist in a Notebook section",
        body: "Open an editable Notebook, edit a DQL section and append the same prompt + execute fields used in Dashboards. The 'Open with… > Ask a question' action triggers Assist; with execute = true the prompt runs automatically.",
        code: {
          language: "dql",
          content:
            '| fieldsAdd prompt = concat("{your question}", your.field.name)\n| fieldsAdd execute = true',
        },
      },
      {
        id: "feedback",
        title: "Provide feedback",
        body: "Submit feedback directly in the Dynatrace Assist chat window using the built-in Give feedback action — this helps tune future Assist responses.",
        link: {
          label: "Give feedback",
          href: "https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/chat-with-dynatrace-assist#feedback",
        },
      },
    ],
  },
  {
    capabilityId: "log-ai-forecasting",
    overview:
      "End-to-end workflow that parses raw logs into structured records with OpenPipeline, extracts a numeric metric, and applies Davis AI (AutoML) forecasting to predict future values for proactive capacity planning and anomaly anticipation.",
    stepGroups: [
      {
        id: "metrics-extraction",
        title: "Part 1 — Metrics extraction (OpenPipeline)",
        startIndex: 0,
      },
      {
        id: "forecasting-usage",
        title: "Part 2 — Forecasting usage (Davis AI)",
        startIndex: 6,
      },
    ],
    prerequisites: [
      {
        id: "grail-tenant",
        title: "Dynatrace SaaS with Grail and AppEngine",
        body: "Your tenant must be powered by Grail and AppEngine — both OpenPipeline metric extraction and Davis AI forecasting run on top of them.",
      },
      {
        id: "log-analytics",
        title: "Log Analytics licensing",
        body: "Either a Dynatrace Platform Subscription (DPS) with Log Analytics capabilities, or DDUs for Log Management and Analytics.",
        link: {
          label: "Log Analytics (DPS)",
          href: "https://docs.dynatrace.com/docs/license/capabilities/log-analytics",
        },
      },
      {
        id: "dql-basics",
        title: "Basic DQL familiarity",
        body: "Comfort writing fetch / filter / timeseries / summarize / parse queries in Dynatrace Query Language.",
        link: {
          label: "Dynatrace Query Language",
          href: "https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language",
        },
      },
      {
        id: "openpipeline-concepts",
        title: "OpenPipeline concepts",
        body: "Understand pipelines, processors (DQL, Value metric) and dynamic routing — these are the building blocks used in Step 1.",
        link: {
          label: "Processing in OpenPipeline",
          href: "https://docs.dynatrace.com/docs/platform/openpipeline/concepts/processing",
        },
      },
      {
        id: "min-datapoints",
        title: "At least 14 data points to forecast",
        body: "Davis AI needs a minimum of 14 data points in the input time series. Check your metric resolution and lookback (e.g. 1h × 14d) before triggering a forecast.",
      },
    ],
    steps: [
      {
        id: "find-log-lines",
        title: "1.1 — Find the relevant log lines in Grail",
        body: "In Notebooks, run a DQL query to identify the log lines you want to parse (filter by namespace, content pattern, etc.) before building the pipeline.",
        code: {
          language: "dql",
          content:
            'fetch logs\n| filter k8s.namespace.name == "online-boutique"\n| filter matchesValue(content, "AddItemAsync*")\n| fields timestamp, content\n| limit 250',
        },
      },
      {
        id: "create-pipeline",
        title: "1.2 — Create the OpenPipeline pipeline",
        body: "Go to Settings > Process and contextualize > OpenPipeline > Logs > Pipelines and create a new pipeline (e.g. 'Online Boutique').",
      },
      {
        id: "parsing-processor",
        title: "1.3 — Configure a parsing processor",
        body: 'Inside the pipeline, add a Processing > DQL processor with a matching condition (e.g. matchesValue(content, "AddItemAsync*")) and a parse definition that extracts userId, productId and quantity from the raw content.',
        code: {
          language: "dql",
          content:
            'parse content, "\\"AddItemAsync called with userId=\\"LD:userId\\", productId=\\"LD:productId, \\"quantity=\\"INT:quantity"',
        },
      },
      {
        id: "metric-extraction",
        title: "1.4 — Configure metric extraction",
        body: "Add a Metric extraction > Value metric processor. Use the parsed quantity field, key it as log.add_item_product_quantity_by_product, and add productId as a custom dimension so the metric is sliceable per product.",
      },
      {
        id: "dynamic-routing",
        title: "1.5 — Route data to the pipeline",
        body: 'Under OpenPipeline > Logs > Dynamic routing, create a route matching k8s.namespace.name == "online-boutique" and bind it to the new pipeline so matching logs flow through your processors.',
      },
      {
        id: "verify-config",
        title: "1.6 — Verify the configuration (optional)",
        body: "Generate a logs.ingest token, POST a sample record to the logs ingest endpoint, and verify the parsed fields and the extracted metric appear in two Notebook DQL sections. A 204 response from the API confirms the ingest worked.",
        code: {
          language: "bash",
          content:
            'curl -i -X POST "https://{your-environment-id}.live.dynatrace.com/api/v2/logs/ingest" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Api-Token <your-API-token>" \\\n  -d "{\\"k8s.namespace.name\\":\\"online-boutique\\",\\"content\\":\\"AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4\\"}"',
        },
      },
      {
        id: "query-metric",
        title: "2A.1 — Query the extracted log metric",
        body: "Open a Notebook section and query the metric created in Step 1 with the timeseries command. Use at least the last 14 days at 1-hour intervals so Davis AI has enough data points.",
        code: {
          language: "dql",
          content:
            "timeseries avg(log.add_item_product_quantity_by_product), interval: 1h, by: {productId}, from: -14d",
        },
      },
      {
        id: "forecast-chart",
        title: "2A.2 — Trigger the forecast from the chart",
        body: "In the chart output, click any time series line, then select 'Filter and forecast' from the context menu. Davis AI's AutoML picks the best forecaster (Sampling or Linear Extrapolation) based on variance and seasonality, and trains it on the historical data.",
      },
      {
        id: "interpret-forecast",
        title: "2A.3 — Interpret the forecast result",
        body: "Read the solid line as the predicted median value and the shaded area as the prediction interval (upper / lower bounds). Focus on the lower bound to decide when a resource may breach a critical threshold — that's the worst-case scenario.",
      },
      {
        id: "act-results",
        title: "2A.4 — Act on the results",
        body: "Prioritise products / hosts that need attention, schedule capacity changes proactively, and share the Notebook as a living planning document with stakeholders.",
      },
      {
        id: "create-workflow",
        title: "2B.1 — Create a forecast workflow",
        body: "For automation, press CTRL+K, search for Workflows and create a new workflow (e.g. 'Weekly Log Metric Forecast').",
      },
      {
        id: "scheduled-trigger",
        title: "2B.2 — Configure a scheduled trigger",
        body: "Set the workflow's trigger to Scheduled and pick a recurring slot (e.g. every Monday at 08:00) so the report arrives during business hours instead of in alert storms.",
      },
      {
        id: "davis-forecast-action",
        title: "2B.3 — Add a Davis Forecast action",
        body: "Add a Davis Forecast action and feed it the same timeseries query used in 2A.1. Configure forecast horizon (e.g. 168 = 7 days at 1h intervals), coverage probability (0.9) and forecast offset (1).",
        code: {
          language: "dql",
          content:
            "timeseries avg(log.add_item_product_quantity_by_product), interval: 1h, by: {productId}, from: -14d",
        },
      },
      {
        id: "threshold-filter",
        title: "2B.4 — Filter on critical thresholds",
        body: "Add a Condition / Script step after the forecast and keep only items whose lower-bound maximum breaches your SLA/capacity threshold — these are the ones you actually want to flag.",
        code: {
          language: "javascript",
          content:
            "// Filter products where forecast lower bound exceeds capacity threshold\nreturn execution.result.forecasts.filter(\n  product => product.lowerBound.max > threshold\n);",
        },
      },
      {
        id: "notification",
        title: "2B.5 — Add a notification action",
        body: "Append a Send email (or Slack / PagerDuty / webhook) action. Send a single consolidated report listing the filtered products/resources, forecast values and the estimated time of threshold breach.",
      },
      {
        id: "optional-remediation",
        title: "2B.6 — (Optional) Add automated remediation",
        body: "Extend the workflow with an action that scales infrastructure, triggers a Terraform plan or calls a custom API on the filtered items — closing the loop into 'extract metric → forecast → identify → remediate'.",
      },
      {
        id: "save-activate",
        title: "2B.7 — Save and activate",
        body: "Review the workflow, click Save, and toggle it to Active. The first scheduled run will produce the inaugural proactive forecast report.",
        link: {
          label: "Davis AI Forecast Analysis",
          href: "https://docs.dynatrace.com/docs/dynatrace-intelligence/reference/ai-models/forecast-analysis",
        },
      },
    ],
  },
];

export const getLearningContent = (
  capabilityId: string
): LearningContent | undefined =>
  learningContent.find((c) => c.capabilityId === capabilityId);

export const getLearningItemCount = (content: LearningContent): number =>
  content.prerequisites.length + content.steps.length;
