# dtctl — IDE & CLI Setup Guide

> `dtctl` (Dynatrace Control) is an open-source, `kubectl`-inspired CLI for the Dynatrace platform.
> It is designed for platform engineers, SREs, developers, and AI agents.
> Community-supported — not officially supported by Dynatrace.
> GitHub: [dynatrace-oss/dtctl](https://github.com/dynatrace-oss/dtctl)

---

## Prerequisites

| Requirement | Details |
|---|---|
| Dynatrace Environment | Platform URL: `https://<env-id>.apps.dynatrace.com` |
| Authentication | Dynatrace SSO (recommended) or API/Platform token |
| OS | macOS, Linux, Windows |

---

## Installation

### macOS — Homebrew (Recommended)

```bash
brew install dynatrace-oss/tap/dtctl
```

### macOS / Linux — Shell Script

```bash
curl -fsSL https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.sh | sh
```

Override the install directory if needed:

```bash
curl -fsSL https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.sh | DTCTL_INSTALL_DIR=~/bin sh
```

To update, re-run the same command.

### Windows — PowerShell

```powershell
irm https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.ps1 | iex
```

This downloads the latest release to `%LOCALAPPDATA%\dtctl` and adds it to your `PATH`.
Restart your terminal or IDE afterwards for the PATH change to take effect.

### Manual Binary Download

1. Visit the [releases page](https://github.com/dynatrace-oss/dtctl/releases)
2. Download the binary for your OS and architecture
3. Extract:
   ```bash
   tar -xzf dtctl_*.tar.gz
   chmod +x dtctl
   ```
4. macOS only — remove Gatekeeper quarantine:
   ```bash
   sudo xattr -r -d com.apple.quarantine dtctl
   ```
5. Move to a directory on your `PATH`:
   ```bash
   mv dtctl /usr/local/bin/
   ```

> **macOS note:** dtctl binaries are not Apple-signed. Use the quarantine removal command above if macOS blocks execution. Always verify you downloaded from the official GitHub releases page and check `checksums.txt`.

---

## Authentication

### Option 1 — OAuth Login (Recommended, no token management)

```bash
dtctl auth login --context my-env --environment "https://<env-id>.apps.dynatrace.com"
```

This opens your browser for Dynatrace SSO login. Tokens are managed automatically.

### Option 2 — API / Platform Token

```bash
dtctl auth login \
  --context my-env \
  --environment "https://<env-id>.apps.dynatrace.com" \
  --token "dt0s16.XXXX.xxxxxxxx"
```

### Verify Authentication

```bash
dtctl doctor
dtctl auth whoami
```

### Multi-Environment Configuration

```bash
# Add a second environment
dtctl auth login --context prod --environment "https://prod-env.apps.dynatrace.com"
dtctl auth login --context staging --environment "https://staging-env.apps.dynatrace.com"

# Switch context
dtctl config use-context prod

# List contexts
dtctl config get-contexts

# Show current context
dtctl config current-context
```

---

## Shell Completion

### bash

```bash
dtctl completion bash > /etc/bash_completion.d/dtctl
# or for user install:
dtctl completion bash >> ~/.bashrc
```

### zsh

```bash
dtctl completion zsh > "${fpath[1]}/_dtctl"
# or:
echo 'source <(dtctl completion zsh)' >> ~/.zshrc
```

### PowerShell

```powershell
dtctl completion powershell | Out-String | Invoke-Expression
```

---

## Core Commands

dtctl uses familiar `verb-noun` syntax (like `kubectl`):

```bash
# List resources
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
dtctl get workflows --watch
```

### Structured Output for AI Agents

```bash
# Machine-readable JSON output
dtctl get workflows --agent -o json

# Full command catalog for agent bootstrapping
dtctl commands --brief -o json
```

---

## IDE Integration

### VS Code

dtctl works directly in the integrated terminal. For AI agent workflows, install the Agent Skill:

```bash
# Install via skills.sh
npx skills add dynatrace-oss/dtctl

# Or with dtctl itself (auto-detects your AI agent)
dtctl skills install

# Explicit target
dtctl skills install --for claude   # Claude Code
dtctl skills install --global       # User-wide, all agents
```

Compatible AI agents: GitHub Copilot, Claude Code, Cursor, Kiro, Junie, OpenCode, OpenClaw, and other Agent Skills-compatible tools.

### JetBrains IDEs

Use dtctl from the built-in **Terminal** panel. The Agent Skill works with JetBrains AI Assistant:

```bash
dtctl skills install --for junie
```

### Cursor

dtctl can be invoked directly from Cursor's terminal. For AI agent usage:

```bash
dtctl skills install --for cursor
```

---

## AI Agent Mode

dtctl is designed from the ground up for AI agent automation loops:

```bash
# Agents discover available commands at runtime
dtctl commands --brief -o json

# Structured output with follow-up suggestions
dtctl get workflows --agent

# Safety levels prevent unintended changes
# readonly | readwrite-mine | readwrite-all | dangerously-unrestricted
dtctl get workflows --safety readonly
```

### Install Dynatrace Domain Knowledge Skills

For deeper domain knowledge (DQL syntax, dashboards, Kubernetes, logs):

```bash
# From Dynatrace/dynatrace-for-ai
dtctl skills install --from dynatrace/dynatrace-for-ai
```

---

## Common Workflows

### Pull, Edit, and Push a Dashboard

```bash
# Get the dashboard ID
dtctl get dashboards

# Export to file
dtctl describe dashboard <id> -o json > my-dashboard.json

# Edit it
code my-dashboard.json   # or vim, nano, etc.

# Push it back
dtctl apply -f my-dashboard.json
```

### Run a DQL Query and Format Output

```bash
dtctl query "fetch logs | filter loglevel == \"ERROR\" | limit 20" -o table
```

### Manage Workflows Declaratively

```bash
# Export workflow
dtctl describe workflow <id> -o yaml > workflow.yaml

# Modify and apply
dtctl apply -f workflow.yaml

# Execute a workflow
dtctl exec workflow <id>
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DTCTL_CONTEXT` | Override the active context |
| `DTCTL_ENVIRONMENT` | Override the environment URL |
| `DTCTL_TOKEN` | Override authentication token |
| `DTCTL_INSTALL_DIR` | Custom install directory (install script) |

---

## Troubleshooting

```bash
# Verify setup
dtctl doctor

# Check current context and identity
dtctl config current-context
dtctl config describe-context
dtctl auth whoami

# Verbose output for debugging
dtctl get workflows --verbose
```

**macOS binary blocked by Gatekeeper:**
```bash
sudo xattr -r -d com.apple.quarantine /path/to/dtctl
chmod +x /path/to/dtctl
```

**PATH not updated after Windows install:**
Close and reopen your terminal or IDE after installation.

---

## References

- [GitHub — dynatrace-oss/dtctl](https://github.com/dynatrace-oss/dtctl)
- [Quick Start Guide](https://github.com/dynatrace-oss/dtctl/blob/main/docs/QUICK_START.md)
- [Installation Guide](https://github.com/dynatrace-oss/dtctl/blob/main/docs/INSTALLATION.md)
- [Dynatrace Hub — dtctl](https://www.dynatrace.com/hub/detail/dtctl/)
- [Community announcement](https://community.dynatrace.com/t5/Community-Voices/Introducing-dtctl-Your-Dynatrace-Platform-One-Command-Away/ba-p/295465)
- [dtctl blog post](https://www.dynatrace.com/news/blog/dtctl-the-dynatrace-observability-cli-thats-built-for-ai-agents-and-humans/)
