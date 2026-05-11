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
