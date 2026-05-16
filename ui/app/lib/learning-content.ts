export type LearningCodeLanguage = "bash" | "json" | "yaml" | "javascript" | "typescript";

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

export interface LearningContent {
  capabilityId: string;
  overview: string;
  prerequisites: LearningPrerequisite[];
  steps: LearningStep[];
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
];

export const getLearningContent = (
  capabilityId: string
): LearningContent | undefined =>
  learningContent.find((c) => c.capabilityId === capabilityId);

export const getLearningItemCount = (content: LearningContent): number =>
  content.prerequisites.length + content.steps.length;
