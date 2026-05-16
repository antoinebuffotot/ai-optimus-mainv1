# Dynatrace MCP Server Setup Guide

> Source: https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-mcp

---

## Overview

The Dynatrace MCP (Model Context Protocol) server hosts tools that external agents (e.g., GitHub Copilot in VS Code, Claude Desktop) can use to fulfill user requests.

**Supported use cases:**
- Generate and explain DQL queries with generative AI
- Answer product-related questions
- Run generated DQL queries
- Investigate problems and vulnerabilities
- Analyze Kubernetes events
- Forecast and analyze timeseries data
- Find documents and troubleshooting guides
- Resolve entity names and IDs

---

## Server URL

```
https://{environment-name}.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp
```

---

## Step 1 – Prepare a Bearer Token

1. Generate a token using a **Platform Token** (recommended) or an OAuth client.
   - > ⚠️ Dynatrace does **not** support OAuth clients for direct remote MCP connections. Use Platform Tokens instead.
   - > ⚠️ OAuth client tokens are valid for **5 minutes only**.
2. Ensure the token is scoped to your user permissions.
3. Refer to the [Platform Tokens docs](https://docs.dynatrace.com/docs/manage/identity-access-management/access-tokens-and-oauth-clients/platform-tokens) or [OAuth Clients docs](https://docs.dynatrace.com/docs/manage/identity-access-management/access-tokens-and-oauth-clients/oauth-clients) for generation details.

---

## Step 2 – Get MCP-Related Permissions

Both the **user** and the **token** must have the following permissions:

- `mcp-gateway:servers:invoke`
- `mcp-gateway:servers:read`

---

## Step 3 – Configure VS Code

1. Open your workspace in VS Code.
2. Inside the `.vscode` folder, create or open `mcp.json` (path: `.vscode/mcp.json`).
3. Add the following configuration:

```json
{
  "servers": {
    "dynatrace-mcp": {
      "url": "https://{environment-name}.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_BEARER_TOKEN_HERE"
      }
    }
  }
}
```

4. Replace `{environment-name}` with your Dynatrace environment identifier.
5. Replace `YOUR_BEARER_TOKEN_HERE` with your generated token.
6. Save the file.
7. Click **Start** above the server name in VS Code.

> ⚠️ VS Code does **not** auto-refresh expired tokens. Regenerate and update the token manually when it expires.

---

## Step 4 – Verify the Setup

1. Open **Copilot Chat** in VS Code.
2. Press `Ctrl+#` to open the list of contexts.
3. Select **Tools**.
4. Find and select `dynatrace-mcp (All tools)`.
5. Enter the prompt: `Show me last 10 logs`
6. Run the prompt.

If configured correctly, you will receive a response from the Dynatrace MCP server.

---

## Related Resources

- [Dynatrace Intelligence Agentic & Generative AI Overview](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/dynatrace-generative-ai-overview)
- [Dynatrace Assist](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/chat-with-dynatrace-assist)
- [VS Code MCP Servers Guide](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
