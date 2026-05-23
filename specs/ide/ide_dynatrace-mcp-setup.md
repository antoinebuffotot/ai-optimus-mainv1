# Dynatrace MCP Server — IDE Setup Guide

> **Note:** The local OSS MCP server (`@dynatrace-oss/dynatrace-mcp-server`) is in **Maintenance Mode**.
> Prefer the **Remote MCP Server** (GA, no local setup required) where possible.
> For Dynatrace **Managed** (self-hosted), use [`dynatrace-managed-mcp`](https://github.com/dynatrace-oss/dynatrace-managed-mcp) instead.

---

## Prerequisites

| Requirement | Details |
|---|---|
| Node.js | v22.10 or newer (local/OSS server only) |
| Dynatrace Environment | Platform URL: `https://<env-id>.apps.dynatrace.com` |
| Authentication | Platform Token **or** OAuth Client credentials |
| IDE | VS Code, Cursor, JetBrains, Windsurf, or any MCP-compatible client |

> ⚠️ Do **not** use Dynatrace Classic URLs (`abc12345.live.dynatrace.com`). The MCP server requires a **Platform (Gen 3)** URL.

---

## Authentication Setup

### Option A — OAuth Client (Recommended)

1. In Dynatrace, go to **Platform → OAuth Clients → Create Client**
2. Assign the required scopes (adjust for your use case):
   ```
   storage:logs:read
   storage:metrics:read
   storage:events:read
   storage:bizevents:read
   app-engine:apps:run
   automation:workflows:read
   ```
3. Note down:
   - `OAUTH_CLIENT_ID` (format: `dt0s02.XXXX`)
   - `OAUTH_CLIENT_SECRET` (format: `dt0s02.XXXX.xxxxxxxx`)

### Option B — Platform Token (v0.5.0+, limited scope)

1. Go to **Access Tokens → Generate New Token**
2. Select required scopes for your use case
3. Note down your token (`dt0s16.XXXX.xxxxxxxx`)

### Option C — Browser Auth Code Flow (Local OSS only)

No token needed — authentication is handled interactively in your browser on first run.

---

## Remote MCP Server (Recommended — GA)

No local installation needed. Connect directly from your IDE using the hosted endpoint.

### MCP URL

```
https://<env-id>.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp
```

---

## VS Code Setup

### With Remote MCP Server

1. Open your workspace in VS Code
2. Create or open `.vscode/mcp.json`:

```json
{
  "servers": {
    "dynatrace-mcp": {
      "type": "http",
      "url": "https://<env-id>.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_BEARER_TOKEN_HERE"
      }
    }
  }
}
```

3. Click **Start** above the server name in the MCP panel
4. Open **Copilot Chat → Tools → dynatrace-mcp (All tools)**

> ⚠️ VS Code does **not** auto-refresh expired tokens. Regenerate and update the config when tokens expire.

### With Local OSS Server (STDIO)

```json
{
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
}
```

Or using a Platform Token:

```json
{
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
}
```

---

## Cursor Setup

Create or edit `~/.cursor/mcp.json` (global) or `<project>/.cursor/mcp.json` (workspace):

```json
{
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
}
```

Restart Cursor and verify the server appears in **Settings → MCP**.

---

## JetBrains IDEs (IntelliJ, PyCharm, GoLand, etc.)

1. Open **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+** to add a new server
3. Choose **Command** type and configure:
   - **Command:** `npx`
   - **Arguments:** `-y @dynatrace-oss/dynatrace-mcp-server@latest`
   - **Environment Variables:**
     ```
     DT_ENVIRONMENT=https://<env-id>.apps.dynatrace.com
     OAUTH_CLIENT_ID=dt0s02.XXXX
     OAUTH_CLIENT_SECRET=dt0s02.XXXX.xxxxxxxx
     ```

---

## Windsurf Setup

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
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
}
```

---

## Amazon Q Developer

Create `<project>/.amazonq/mcp.json`:

```json
{
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
}
```

---

## Local Dev Build (Contributing / Customizing)

```bash
# Clone the repo
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
npm run watch
```

VS Code dev config (`.vscode/mcp.json`):

```json
{
  "servers": {
    "my-dynatrace-mcp-server": {
      "command": "node",
      "args": ["--watch", "${workspaceFolder}/dist/index.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

---

## Grail Permissions

Ensure your OAuth client or token user has the required Grail bucket permissions.
See: [Assign permissions in Grail](https://docs.dynatrace.com/docs/discover-dynatrace/platform/grail/data-model/assign-permissions-in-grail)

---

## Example Prompts to Test the Setup

```
Show me the last 10 error logs
Get all details of the entity 'my-service'
Create a DQL query to fetch error logs from the last hour
Show me all open security vulnerabilities
List all active workflows
Show anomalies detected in the last 24 hours
```

---

## References

- [Dynatrace MCP Docs](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-mcp)
- [GitHub — dynatrace-oss/dynatrace-mcp](https://github.com/dynatrace-oss/dynatrace-mcp)
- [Dynatrace Hub — MCP Server](https://www.dynatrace.com/hub/detail/dynatrace-mcp-server/)
- [MCP Setup Guide (community)](https://github.com/dynatrace-tech-alliances/mcp-guide)
- [npm package](https://www.npmjs.com/package/@dynatrace-oss/dynatrace-mcp-server)
