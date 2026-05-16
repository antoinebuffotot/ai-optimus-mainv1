# dtctl Installation & Setup Guide

> Source: https://github.com/dynatrace-oss/dtctl  
> License: Apache-2.0 | Latest Release: v0.11.0

`dtctl` is a `kubectl`-inspired CLI for managing Dynatrace platform resources (workflows, dashboards, DQL queries, and more) from your terminal.

> ⚠️ **Early Development**: This project is in active development. If you encounter bugs, please [file a GitHub issue](https://github.com/dynatrace-oss/dtctl/issues/new).

---

## Prerequisites

- A Dynatrace environment URL (e.g. `https://abc12345.apps.dynatrace.com`)
- A Dynatrace API token with the required scopes (see [Token Scopes](https://github.com/dynatrace-oss/dtctl/blob/main/docs/TOKEN_SCOPES.md))

---

## Installation

### Option 1 – Download a Pre-built Release (Recommended)

1. Go to the [latest releases page](https://github.com/dynatrace-oss/dtctl/releases/latest).
2. Download the binary for your platform (Linux, macOS, Windows).
3. Move the binary to a directory in your `$PATH`, for example:

```bash
mv dtctl /usr/local/bin/dtctl
chmod +x /usr/local/bin/dtctl
```

### Option 2 – Build from Source

Requirements: [Go](https://go.dev/) installed.

```bash
git clone https://github.com/dynatrace-oss/dtctl.git
cd dtctl
make build
make install
```

---

## Configuration

### Step 1 – Set a Context

A context links a name to your Dynatrace environment URL and a token reference.

```bash
dtctl config set-context my-env \
  --environment "https://abc12345.apps.dynatrace.com" \
  --token-ref my-token
```

### Step 2 – Set Credentials

Store your Dynatrace API token under the reference name used above.

```bash
dtctl config set-credentials my-token --token "dt0s16.YOUR_TOKEN"
```

---

## Verify the Setup

Run a quick command to confirm everything is working:

```bash
dtctl get workflows
```

---

## Shell Completion (Optional)

`dtctl` supports tab completion for bash, zsh, fish, and PowerShell. Refer to [INSTALLATION.md](https://github.com/dynatrace-oss/dtctl/blob/main/docs/INSTALLATION.md) for shell-specific setup instructions.

---

## AI Agent Skill (Optional)

`dtctl` ships with an [Agent Skill](https://agentskills.io) that teaches AI assistants how to use it.

Copy the skill to your AI tool's skills folder:

```bash
# For GitHub Copilot
cp -r skills/dtctl ~/.github/skills/

# For Claude Code
cp -r skills/dtctl ~/.claude/skills/
```

Compatible with GitHub Copilot, Claude Code, and other Agent Skills tools.

---

## Common Commands

```bash
dtctl get workflows                          # List all workflows
dtctl get workflows --watch                  # Real-time monitoring
dtctl query "fetch logs | limit 10"          # Run a DQL query
dtctl query "fetch logs" --live              # Live query results
dtctl diff -f workflow.yaml                  # Compare local vs remote
dtctl edit dashboard "Production Overview"   # Edit a resource in $EDITOR
dtctl apply -f workflow.yaml                 # Apply declarative config
dtctl create lookup -f errors.csv \
  --path /lookups/production/errors \
  --lookup-field code                        # Create a lookup table from CSV
```

---

## Supported Resources

| Resource | Operations |
|---|---|
| Workflows | get, describe, create, edit, delete, execute, history, diff |
| Dashboards & Notebooks | get, describe, create, edit, delete, share, diff |
| DQL Queries | execute with template variables, verify syntax |
| SLOs | get, create, delete, apply, evaluate |
| Settings | get schemas, get/create/update/delete objects |
| Buckets | get, describe, create, delete |
| Lookup Tables | get, describe, create, delete (CSV auto-detection) |
| App Functions | get, describe, execute |
| App Intents | get, describe, find, open |
| Apps, EdgeConnect, Davis AI | various |

---

## Further Reading

- [Quick Start Guide](https://github.com/dynatrace-oss/dtctl/blob/main/docs/QUICK_START.md)
- [Token Scopes](https://github.com/dynatrace-oss/dtctl/blob/main/docs/TOKEN_SCOPES.md)
- [API Design Reference](https://github.com/dynatrace-oss/dtctl/blob/main/docs/dev/API_DESIGN.md)
- [Architecture](https://github.com/dynatrace-oss/dtctl/blob/main/docs/dev/ARCHITECTURE.md)
- [Contributing](https://github.com/dynatrace-oss/dtctl/blob/main/CONTRIBUTING.md)
