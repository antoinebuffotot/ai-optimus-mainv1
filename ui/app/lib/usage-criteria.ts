// Each criterion is "met" when its DQL query returns at least one record (count > 0).
// Queries are best-effort starting points — adjust event types / field names to your
// tenant schema. The hook treats any execution error as "unknown" so the page degrades
// gracefully if a query needs tuning.

export interface UsageCriterion {
  id: string;
  capabilityId: string;
  label: string;
  dql: string;
}

export const usageCriteria: UsageCriterion[] = [
  {
    id: "davis-intelligence-workflow",//OK
    capabilityId: "davis-intelligence",
    label: "Workflow triggered by a Davis problem",
    dql: 'fetch dt.system.events, from:now()-30d | filter event.type == "WORKFLOW_EXECUTION" AND dt.automation_engine.state == "SUCCESS" | lookup [fetch dt.davis.problems], sourceField:dt.automation_engine.workflow_execution.trigger.event.id, lookupField:event.id | summarize c = count() | filter c > 0',
  },
  {
    id: "davis-intelligence-troubleshooting",
    capabilityId: "davis-intelligence",
    label: "Troubleshooting Guide linked to problems",
    dql: 'fetch dt.system.events, from:now()-30d | filter dt.app.id == "dynatrace.davis.problems" AND resource == "/platform/document/v1/documents" | summarize c = count() | filter c > 0',
  },
  {
    id: "davis-assist-usage",
    capabilityId: "davis-assist",
    label: "Davis Assist usage event present",
    dql: 'fetch dt.system.events, from:now()-30d| filter event.kind == "GENAI_EVENT"| filter event.type == "GenAI Skill Invocation"| summarize c = count() | filter c > 0',
  },
  {
    id: "ai-workflows-intelligence-action",
    capabilityId: "ai-workflows",
    label: "Workflow using a Dynatrace Intelligence action",
    dql: 'fetch dt.system.events, from:now()-30d | filter  dt.automation_engine.state == "SUCCESS" | filter dt.automation_engine.action.app == "dynatrace.davis.copilot.workflow.actions"|summarize c = count() | filter c > 0',
  },
  {
    id: "mcp-server-usage",
    capabilityId: "mcp-server",
    label: "MCP Server usage event present",
    dql: 'fetch dt.system.events,from:now()-30d | filter server == "dynatrace-mcp" | filter event.type == "MCP Tool Invocation" | summarize c = count() | filter c > 0',
  },
  {
    id: "log-ai-forecasting-usage", 
    capabilityId: "log-ai-forecasting",
    label: "Forecasting executed",
    dql: 'fetch dt.system.events,from:now()-30d | filter event.kind == "QUERY_EXECUTION_EVENT" and client.source == "dt.statistics.ui.ForecastAnalyzer"| summarize c = count() | filter c > 0',
  },
  {
    id: "ai-observability-data",
    capabilityId: "ai-observability",
    label: "AI/LLM observability spans present",
    dql: 'fetch spans, from:now()-30d | filter isNotNull(gen_ai.system) or isNotNull(gen_ai.provider.name) | summarize c = count() | filter c > 0',
  },
];

export const usageCapabilityIds: string[] = Array.from(
  new Set(usageCriteria.map((c) => c.capabilityId))
);

// Per-capability queries that fetch the most recent usage events (timestamp + user)
// for display in the Usage Assessment accordion. Each query aliases the
// user-identifying column to `user` so the UI can render a stable schema.
export interface LatestUsageQuery {
  capabilityId: string;
  dql: string;
}

export const latestUsageQueries: LatestUsageQuery[] = [
  {
    capabilityId: "davis-intelligence",
    dql: 'fetch dt.system.events, from:now()-30d | filter dt.app.id == "dynatrace.davis.problems" AND resource == "/platform/document/v1/documents" | lookup [fetch dt.system.events | dedup user.email,user.id | fields user.email,user.id], sourceField:user.id, lookupField:user.id | fields timestamp, user = lookup.user.email | sort timestamp desc | limit 20',
  },
  {
    capabilityId: "davis-assist",
    dql: 'fetch dt.system.events, from:now()-30d | filter event.kind == "GENAI_EVENT" | filter event.type == "GenAI Skill Invocation" | fields timestamp, user = user_email | sort timestamp desc | limit 20',
  },
  {
    capabilityId: "ai-workflows",
    dql: 'fetch dt.system.events, from:now()-30d | filter dt.automation_engine.state == "SUCCESS" | filter dt.automation_engine.action.app == "dynatrace.davis.copilot.workflow.actions" | fields timestamp, dt.automation_engine.workflow.title, dt.automation_engine.task.name | sort timestamp desc | limit 20',
  },
  {
    capabilityId: "mcp-server",
    dql: 'fetch dt.system.events, from:now()-30d | filter server == "dynatrace-mcp" | filter event.type == "MCP Tool Invocation" | fields timestamp, user = user_email | sort timestamp desc | limit 20',
  },
  {
    capabilityId: "log-ai-forecasting",
    dql: 'fetch dt.system.events, from:now()-30d | filter event.kind == "QUERY_EXECUTION_EVENT" and client.source == "dt.statistics.ui.ForecastAnalyzer" | fields timestamp, user = user.email | sort timestamp desc | limit 20',
  },
  {
    capabilityId: "ai-observability",
    dql: 'fetch spans, from:now()-30d | filter isNotNull(gen_ai.system) or isNotNull(gen_ai.provider.name) | fields timestamp = start_time, service.name, k8s.deployment.name, k8s.container.name, gen_ai.response.model, gen_ai.provider.name | sort timestamp desc | limit 20',
  },
];
