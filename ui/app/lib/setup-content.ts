import type { GuideSectionData } from "../components/GuideSection";

export interface SetupGuideContent {
  id: string;
  name: string;
  overview: string;
  sections: GuideSectionData[];
}

export const setupGuides: SetupGuideContent[] = [
  {
    id: "mcp",
    name: "Dynatrace MCP Server",
    overview:
      "Connect your IDE or AI agent to Dynatrace through the MCP server. Prefer the remote MCP server (GA, no local setup); the local OSS server is in maintenance mode but supported for stdio/dev workflows.",
    sections: [
      {
        type: "note",
        text: "The local OSS MCP server (`@dynatrace-oss/dynatrace-mcp-server`) is in Maintenance Mode. Prefer the Remote MCP Server (GA, no local setup) where possible. For Dynatrace Managed (self-hosted), use `dynatrace-managed-mcp` instead.",
      },

      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "table",
        headers: ["Requirement", "Details"],
        rows: [
          ["Node.js", "v22.10 or newer (local/OSS server only)"],
          [
            "Dynatrace Environment",
            "Platform URL: https://<env-id>.apps.dynatrace.com",
          ],
          [
            "Authentication",
            "Platform Token or OAuth Client credentials",
          ],
          [
            "IDE",
            "VS Code, Cursor, JetBrains, Windsurf, or any MCP-compatible client",
          ],
        ],
      },
      {
        type: "note",
        text: "Do NOT use Dynatrace Classic URLs (abc12345.live.dynatrace.com). The MCP server requires a Platform (Gen 3) URL.",
      },

      { type: "heading", level: 2, text: "Authentication Setup" },
      {
        type: "heading",
        level: 3,
        text: "Option A — OAuth Client (Recommended)",
      },
      {
        type: "ordered-list",
        items: [
          "In Dynatrace, go to Platform → OAuth Clients → Create Client.",
          "Assign the required scopes (adjust for your use case) — see snippet below.",
          {
            text: "Note down:",
            sub: [
              "OAUTH_CLIENT_ID (format: dt0s02.XXXX)",
              "OAUTH_CLIENT_SECRET (format: dt0s02.XXXX.xxxxxxxx)",
            ],
          },
        ],
      },
      {
        type: "code",
        title: "Required OAuth scopes",
        language: "bash",
        content: `storage:logs:read
storage:metrics:read
storage:events:read
storage:bizevents:read
app-engine:apps:run
automation:workflows:read`,
      },
      {
        type: "heading",
        level: 3,
        text: "Option B — Platform Token (v0.5.0+, limited scope)",
      },
      {
        type: "ordered-list",
        items: [
          "Go to Access Tokens → Generate New Token.",
          "Select required scopes for your use case.",
          "Note down your token (dt0s16.XXXX.xxxxxxxx).",
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Option C — Browser Auth Code Flow (Local OSS only)",
      },
      {
        type: "paragraph",
        text: "No token needed — authentication is handled interactively in your browser on first run.",
      },

      { type: "heading", level: 2, text: "Remote MCP Server (Recommended — GA)" },
      {
        type: "paragraph",
        text: "No local installation needed. Connect directly from your IDE using the hosted endpoint.",
      },
      {
        type: "code",
        title: "MCP URL",
        language: "bash",
        content: `https://<env-id>.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp`,
      },

      { type: "heading", level: 2, text: "VS Code Setup" },
      { type: "heading", level: 3, text: "With Remote MCP Server" },
      {
        type: "ordered-list",
        items: [
          "Open your workspace in VS Code.",
          "Create or open `.vscode/mcp.json` with the configuration below.",
          "Click Start above the server name in the MCP panel.",
          "Open Copilot Chat → Tools → dynatrace-mcp (All tools).",
        ],
      },
      {
        type: "code",
        language: "json",
        content: `{
  "servers": {
    "dynatrace-mcp": {
      "type": "http",
      "url": "https://<env-id>.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_BEARER_TOKEN_HERE"
      }
    }
  }
}`,
      },
      {
        type: "note",
        text: "VS Code does NOT auto-refresh expired tokens. Regenerate and update the config when tokens expire.",
      },
      { type: "heading", level: 3, text: "With Local OSS Server (STDIO)" },
      {
        type: "code",
        title: "Using OAuth credentials",
        language: "json",
        content: `{
  "servers": {
    "dynatrace-mcp": {
      "command": "npx",
      "args": ["-y", "@dynatrace-oss/dynatrace-mcp-server@latest"],
      "env": {
        "DT_ENVIRONMENT": "https://<env-id>.apps.dynatrace.com",
        "OAUTH_CLIENT_ID": "dt0s02.XXXX",
        "OAUTH_CLIENT_SECRET": "dt0s02.XXXX.xxxxxxxx"
      }
    }
  }
}`,
      },
      {
        type: "code",
        title: "Using a Platform Token",
        language: "json",
        content: `{
  "servers": {
    "dynatrace-mcp": {
      "command": "npx",
      "args": ["-y", "@dynatrace-oss/dynatrace-mcp-server@latest"],
      "env": {
        "DT_ENVIRONMENT": "https://<env-id>.apps.dynatrace.com",
        "DT_PLATFORM_TOKEN": "dt0s16.XXXX.xxxxxxxx"
      }
    }
  }
}`,
      },

      { type: "heading", level: 2, text: "Cursor Setup" },
      {
        type: "paragraph",
        text: "Create or edit `~/.cursor/mcp.json` (global) or `<project>/.cursor/mcp.json` (workspace):",
      },
      {
        type: "code",
        language: "json",
        content: `{
  "mcpServers": {
    "dynatrace-mcp": {
      "command": "npx",
      "args": ["-y", "@dynatrace-oss/dynatrace-mcp-server@latest"],
      "env": {
        "DT_ENVIRONMENT": "https://<env-id>.apps.dynatrace.com",
        "OAUTH_CLIENT_ID": "dt0s02.XXXX",
        "OAUTH_CLIENT_SECRET": "dt0s02.XXXX.xxxxxxxx"
      }
    }
  }
}`,
      },
      {
        type: "paragraph",
        text: "Restart Cursor and verify the server appears in Settings → MCP.",
      },

      {
        type: "heading",
        level: 2,
        text: "JetBrains IDEs (IntelliJ, PyCharm, GoLand, etc.)",
      },
      {
        type: "ordered-list",
        items: [
          "Open Settings → Tools → AI Assistant → MCP Servers.",
          "Click + to add a new server.",
          {
            text: "Choose Command type and configure:",
            sub: [
              "Command: npx",
              "Arguments: -y @dynatrace-oss/dynatrace-mcp-server@latest",
              "Environment Variables: DT_ENVIRONMENT, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET",
            ],
          },
        ],
      },

      { type: "heading", level: 2, text: "Windsurf Setup" },
      {
        type: "paragraph",
        text: "Edit `~/.codeium/windsurf/mcp_config.json`:",
      },
      {
        type: "code",
        language: "json",
        content: `{
  "mcpServers": {
    "dynatrace-mcp": {
      "command": "npx",
      "args": ["-y", "@dynatrace-oss/dynatrace-mcp-server@latest"],
      "env": {
        "DT_ENVIRONMENT": "https://<env-id>.apps.dynatrace.com",
        "OAUTH_CLIENT_ID": "dt0s02.XXXX",
        "OAUTH_CLIENT_SECRET": "dt0s02.XXXX.xxxxxxxx"
      }
    }
  }
}`,
      },

      { type: "heading", level: 2, text: "Amazon Q Developer" },
      {
        type: "paragraph",
        text: "Create `<project>/.amazonq/mcp.json`:",
      },
      {
        type: "code",
        language: "json",
        content: `{
  "mcpServers": {
    "dynatrace-mcp": {
      "command": "npx",
      "args": ["-y", "@dynatrace-oss/dynatrace-mcp-server@latest"],
      "env": {
        "DT_ENVIRONMENT": "https://<env-id>.apps.dynatrace.com",
        "OAUTH_CLIENT_ID": "dt0s02.XXXX",
        "OAUTH_CLIENT_SECRET": "dt0s02.XXXX.xxxxxxxx"
      }
    }
  }
}`,
      },

      {
        type: "heading",
        level: 2,
        text: "Local Dev Build (Contributing / Customizing)",
      },
      {
        type: "code",
        language: "bash",
        content: `# Clone the repo
git clone https://github.com/dynatrace-oss/dynatrace-mcp.git
cd dynatrace-mcp

# Install dependencies
npm install

# Copy env template and configure
cp .env.template .env
# Edit .env with your DT_ENVIRONMENT, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET

# Build
npm run build

# Or watch mode (auto-recompile)
npm run watch`,
      },
      {
        type: "code",
        title: "VS Code dev config (.vscode/mcp.json)",
        language: "json",
        content: `{
  "servers": {
    "my-dynatrace-mcp-server": {
      "command": "node",
      "args": ["--watch", "\${workspaceFolder}/dist/index.js"],
      "envFile": "\${workspaceFolder}/.env"
    }
  }
}`,
      },

      { type: "heading", level: 2, text: "Grail Permissions" },
      {
        type: "paragraph",
        text: "Ensure your OAuth client or token user has the required Grail bucket permissions.",
      },
      {
        type: "link",
        label: "Assign permissions in Grail",
        href: "https://docs.dynatrace.com/docs/discover-dynatrace/platform/grail/data-model/assign-permissions-in-grail",
      },

      { type: "heading", level: 2, text: "Example Prompts to Test the Setup" },
      {
        type: "list",
        items: [
          "Show me the last 10 error logs",
          "Get all details of the entity 'my-service'",
          "Create a DQL query to fetch error logs from the last hour",
          "Show me all open security vulnerabilities",
          "List all active workflows",
          "Show anomalies detected in the last 24 hours",
        ],
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "Dynatrace MCP Docs",
        href: "https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-mcp",
      },
      {
        type: "link",
        label: "GitHub — dynatrace-oss/dynatrace-mcp",
        href: "https://github.com/dynatrace-oss/dynatrace-mcp",
      },
      {
        type: "link",
        label: "Dynatrace Hub — MCP Server",
        href: "https://www.dynatrace.com/hub/detail/dynatrace-mcp-server/",
      },
      {
        type: "link",
        label: "MCP Setup Guide (community)",
        href: "https://github.com/dynatrace-tech-alliances/mcp-guide",
      },
      {
        type: "link",
        label: "npm package",
        href: "https://www.npmjs.com/package/@dynatrace-oss/dynatrace-mcp-server",
      },
    ],
  },

  {
    id: "dtctl",
    name: "dtctl — Dynatrace Control CLI",
    overview:
      "dtctl is an open-source, kubectl-inspired CLI for the Dynatrace platform. Designed for platform engineers, SREs, developers, and AI agents. Community-supported — not officially supported by Dynatrace.",
    sections: [
      {
        type: "link",
        label: "GitHub — dynatrace-oss/dtctl",
        href: "https://github.com/dynatrace-oss/dtctl",
      },

      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "table",
        headers: ["Requirement", "Details"],
        rows: [
          [
            "Dynatrace Environment",
            "Platform URL: https://<env-id>.apps.dynatrace.com",
          ],
          [
            "Authentication",
            "Dynatrace SSO (recommended) or API/Platform token",
          ],
          ["OS", "macOS, Linux, Windows"],
        ],
      },

      { type: "heading", level: 2, text: "Installation" },
      { type: "heading", level: 3, text: "macOS — Homebrew (Recommended)" },
      {
        type: "code",
        language: "bash",
        content: "brew install dynatrace-oss/tap/dtctl",
      },
      { type: "heading", level: 3, text: "macOS / Linux — Shell Script" },
      {
        type: "code",
        language: "bash",
        content:
          "curl -fsSL https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.sh | sh",
      },
      {
        type: "paragraph",
        text: "Override the install directory if needed:",
      },
      {
        type: "code",
        language: "bash",
        content:
          "curl -fsSL https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.sh | DTCTL_INSTALL_DIR=~/bin sh",
      },
      {
        type: "paragraph",
        text: "To update, re-run the same command.",
      },
      { type: "heading", level: 3, text: "Windows — PowerShell" },
      {
        type: "code",
        language: "bash",
        content:
          "irm https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.ps1 | iex",
      },
      {
        type: "paragraph",
        text: "This downloads the latest release to %LOCALAPPDATA%\\dtctl and adds it to your PATH. Restart your terminal or IDE afterwards for the PATH change to take effect.",
      },
      { type: "heading", level: 3, text: "Manual Binary Download" },
      {
        type: "ordered-list",
        items: [
          "Visit the dtctl releases page on GitHub.",
          "Download the binary for your OS and architecture.",
          "Extract the archive (see snippet below).",
          "macOS only — remove Gatekeeper quarantine.",
          "Move the binary to a directory on your PATH.",
        ],
      },
      {
        type: "code",
        title: "Extract and prepare the binary",
        language: "bash",
        content: `tar -xzf dtctl_*.tar.gz
chmod +x dtctl

# macOS — remove Gatekeeper quarantine
sudo xattr -r -d com.apple.quarantine dtctl

# Move to a directory on your PATH
mv dtctl /usr/local/bin/`,
      },
      {
        type: "note",
        text: "macOS: dtctl binaries are not Apple-signed. Use the quarantine removal command above if macOS blocks execution. Always verify you downloaded from the official GitHub releases page and check checksums.txt.",
      },

      { type: "heading", level: 2, text: "Authentication" },
      {
        type: "heading",
        level: 3,
        text: "Option 1 — OAuth Login (Recommended, no token management)",
      },
      {
        type: "code",
        language: "bash",
        content:
          'dtctl auth login --context my-env --environment "https://<env-id>.apps.dynatrace.com"',
      },
      {
        type: "paragraph",
        text: "This opens your browser for Dynatrace SSO login. Tokens are managed automatically.",
      },
      { type: "heading", level: 3, text: "Option 2 — API / Platform Token" },
      {
        type: "code",
        language: "bash",
        content: `dtctl auth login \\
  --context my-env \\
  --environment "https://<env-id>.apps.dynatrace.com" \\
  --token "dt0s16.XXXX.xxxxxxxx"`,
      },
      { type: "heading", level: 3, text: "Verify Authentication" },
      {
        type: "code",
        language: "bash",
        content: `dtctl doctor
dtctl auth whoami`,
      },
      { type: "heading", level: 3, text: "Multi-Environment Configuration" },
      {
        type: "code",
        language: "bash",
        content: `# Add a second environment
dtctl auth login --context prod --environment "https://prod-env.apps.dynatrace.com"
dtctl auth login --context staging --environment "https://staging-env.apps.dynatrace.com"

# Switch context
dtctl config use-context prod

# List contexts
dtctl config get-contexts

# Show current context
dtctl config current-context`,
      },

      { type: "heading", level: 2, text: "Shell Completion" },
      { type: "heading", level: 3, text: "bash" },
      {
        type: "code",
        language: "bash",
        content: `dtctl completion bash > /etc/bash_completion.d/dtctl
# or for user install:
dtctl completion bash >> ~/.bashrc`,
      },
      { type: "heading", level: 3, text: "zsh" },
      {
        type: "code",
        language: "bash",
        content: `dtctl completion zsh > "\${fpath[1]}/_dtctl"
# or:
echo 'source <(dtctl completion zsh)' >> ~/.zshrc`,
      },
      { type: "heading", level: 3, text: "PowerShell" },
      {
        type: "code",
        language: "bash",
        content:
          "dtctl completion powershell | Out-String | Invoke-Expression",
      },

      { type: "heading", level: 2, text: "Core Commands" },
      {
        type: "paragraph",
        text: "dtctl uses familiar verb-noun syntax (like kubectl):",
      },
      {
        type: "code",
        language: "bash",
        content: `# List resources
dtctl get workflows
dtctl get dashboards
dtctl get notebooks
dtctl get slos
dtctl get settings

# Describe a resource (with full JSON)
dtctl describe workflow <id>
dtctl describe dashboard <id> -o json --plain

# Run a DQL query
dtctl query "fetch logs | limit 10"

# Edit a resource in $EDITOR
dtctl edit dashboard "Production Overview"

# Apply declarative config (YAML/JSON)
dtctl apply -f workflow.yaml

# Delete a resource
dtctl delete workflow <id>

# Watch live updates
dtctl get workflows --watch`,
      },
      { type: "heading", level: 3, text: "Structured Output for AI Agents" },
      {
        type: "code",
        language: "bash",
        content: `# Machine-readable JSON output
dtctl get workflows --agent -o json

# Full command catalog for agent bootstrapping
dtctl commands --brief -o json`,
      },

      { type: "heading", level: 2, text: "IDE Integration" },
      { type: "heading", level: 3, text: "VS Code" },
      {
        type: "paragraph",
        text: "dtctl works directly in the integrated terminal. For AI agent workflows, install the Agent Skill:",
      },
      {
        type: "code",
        language: "bash",
        content: `# Install via skills.sh
npx skills add dynatrace-oss/dtctl

# Or with dtctl itself (auto-detects your AI agent)
dtctl skills install

# Explicit target
dtctl skills install --for claude   # Claude Code
dtctl skills install --global       # User-wide, all agents`,
      },
      {
        type: "paragraph",
        text: "Compatible AI agents: GitHub Copilot, Claude Code, Cursor, Kiro, Junie, OpenCode, OpenClaw, and other Agent Skills-compatible tools.",
      },
      { type: "heading", level: 3, text: "JetBrains IDEs" },
      {
        type: "paragraph",
        text: "Use dtctl from the built-in Terminal panel. The Agent Skill works with JetBrains AI Assistant:",
      },
      {
        type: "code",
        language: "bash",
        content: "dtctl skills install --for junie",
      },
      { type: "heading", level: 3, text: "Cursor" },
      {
        type: "paragraph",
        text: "dtctl can be invoked directly from Cursor's terminal. For AI agent usage:",
      },
      {
        type: "code",
        language: "bash",
        content: "dtctl skills install --for cursor",
      },

      { type: "heading", level: 2, text: "AI Agent Mode" },
      {
        type: "paragraph",
        text: "dtctl is designed from the ground up for AI agent automation loops:",
      },
      {
        type: "code",
        language: "bash",
        content: `# Agents discover available commands at runtime
dtctl commands --brief -o json

# Structured output with follow-up suggestions
dtctl get workflows --agent

# Safety levels prevent unintended changes
# readonly | readwrite-mine | readwrite-all | dangerously-unrestricted
dtctl get workflows --safety readonly`,
      },
      {
        type: "heading",
        level: 3,
        text: "Install Dynatrace Domain Knowledge Skills",
      },
      {
        type: "paragraph",
        text: "For deeper domain knowledge (DQL syntax, dashboards, Kubernetes, logs):",
      },
      {
        type: "code",
        language: "bash",
        content: `# From Dynatrace/dynatrace-for-ai
dtctl skills install --from dynatrace/dynatrace-for-ai`,
      },

      { type: "heading", level: 2, text: "Common Workflows" },
      {
        type: "heading",
        level: 3,
        text: "Pull, Edit, and Push a Dashboard",
      },
      {
        type: "code",
        language: "bash",
        content: `# Get the dashboard ID
dtctl get dashboards

# Export to file
dtctl describe dashboard <id> -o json > my-dashboard.json

# Edit it
code my-dashboard.json   # or vim, nano, etc.

# Push it back
dtctl apply -f my-dashboard.json`,
      },
      {
        type: "heading",
        level: 3,
        text: "Run a DQL Query and Format Output",
      },
      {
        type: "code",
        language: "bash",
        content:
          'dtctl query "fetch logs | filter loglevel == \\"ERROR\\" | limit 20" -o table',
      },
      { type: "heading", level: 3, text: "Manage Workflows Declaratively" },
      {
        type: "code",
        language: "bash",
        content: `# Export workflow
dtctl describe workflow <id> -o yaml > workflow.yaml

# Modify and apply
dtctl apply -f workflow.yaml

# Execute a workflow
dtctl exec workflow <id>`,
      },

      { type: "heading", level: 2, text: "Environment Variables" },
      {
        type: "table",
        headers: ["Variable", "Description"],
        rows: [
          ["DTCTL_CONTEXT", "Override the active context"],
          ["DTCTL_ENVIRONMENT", "Override the environment URL"],
          ["DTCTL_TOKEN", "Override authentication token"],
          [
            "DTCTL_INSTALL_DIR",
            "Custom install directory (install script)",
          ],
        ],
      },

      { type: "heading", level: 2, text: "Troubleshooting" },
      {
        type: "code",
        title: "Verify setup & inspect identity",
        language: "bash",
        content: `# Verify setup
dtctl doctor

# Check current context and identity
dtctl config current-context
dtctl config describe-context
dtctl auth whoami

# Verbose output for debugging
dtctl get workflows --verbose`,
      },
      {
        type: "code",
        title: "macOS binary blocked by Gatekeeper",
        language: "bash",
        content: `sudo xattr -r -d com.apple.quarantine /path/to/dtctl
chmod +x /path/to/dtctl`,
      },
      {
        type: "note",
        text: "PATH not updated after Windows install: close and reopen your terminal or IDE after installation.",
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "GitHub — dynatrace-oss/dtctl",
        href: "https://github.com/dynatrace-oss/dtctl",
      },
      {
        type: "link",
        label: "Quick Start Guide",
        href: "https://github.com/dynatrace-oss/dtctl/blob/main/docs/QUICK_START.md",
      },
      {
        type: "link",
        label: "Installation Guide",
        href: "https://github.com/dynatrace-oss/dtctl/blob/main/docs/INSTALLATION.md",
      },
      {
        type: "link",
        label: "Dynatrace Hub — dtctl",
        href: "https://www.dynatrace.com/hub/detail/dtctl/",
      },
      {
        type: "link",
        label: "Community announcement",
        // eslint-disable-next-line noSecrets/no-secrets
        href: "https://community.dynatrace.com/t5/Community-Voices/Introducing-dtctl-Your-Dynatrace-Platform-One-Command-Away/ba-p/295465",
      },
      {
        type: "link",
        label: "dtctl blog post",
        href: "https://www.dynatrace.com/news/blog/dtctl-the-dynatrace-observability-cli-thats-built-for-ai-agents-and-humans/",
      },
    ],
  },
];

export const getSetupGuide = (id: string): SetupGuideContent | undefined =>
  setupGuides.find((g) => g.id === id);
