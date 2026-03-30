# Claude Code Settings Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/settings

## Overview

Settings control Claude Code behavior: permissions, hooks, model, environment, and more.

## File Locations and Precedence

| Priority | Scope | Location |
|---|---|---|
| 1 (highest) | Managed | Server-managed, MDM/plist/registry, or `managed-settings.json` |
| 2 | CLI args | Command-line flags |
| 3 | Local | `.claude/settings.local.json` (gitignored) |
| 4 | Project | `.claude/settings.json` (committed) |
| 5 (lowest) | User | `~/.claude/settings.json` |

## Schema Validation

```json
{ "$schema": "https://json.schemastore.org/claude-code-settings.json" }
```

## Permission Rules Syntax

Rules use `ToolName(pattern)` format with `*` wildcard:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Read(~/.zshrc)",
      "Skill(commit)",
      "Skill(review-pr *)",
      "Agent(code-reviewer)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Bash(rm -rf *)",
      "Agent(Explore)",
      "Skill(deploy *)"
    ]
  }
}
```

## Key Settings Fields

| Field | Type | Description |
|---|---|---|
| `permissions.allow` | string[] | Tool allowlist rules |
| `permissions.deny` | string[] | Tool denylist rules |
| `hooks` | object | Hook configuration (see hook-spec.md) |
| `env` | object | Environment variables `{ "KEY": "value" }` |
| `model` | string | Default model override |
| `effortLevel` | string | `low`, `medium`, `high`, `max` |
| `agent` | string | Default agent override |
| `autoMemoryEnabled` | boolean | Enable auto memory |
| `autoMemoryDirectory` | string | Custom memory directory |
| `cleanupPeriodDays` | number | Auto-cleanup period |
| `includeGitInstructions` | boolean | Include git context |
| `disableAllHooks` | boolean | Disable all hooks |
| `claudeMdExcludes` | string[] | CLAUDE.md files to skip |
| `enableAllProjectMcpServers` | boolean | Auto-enable MCP servers |
| `statusLine` | object | `{ "type": "command", "command": "script.sh" }` |
| `outputStyle` | string | Response style preference |
| `respectGitignore` | boolean | Honor .gitignore |
| `attribution.commit` | string | Commit message suffix |
| `attribution.pr` | string | PR description suffix |

## Managed-Only Settings (IT/org admin)

| Field | Description |
|---|---|
| `allowManagedHooksOnly` | Block user/project/plugin hooks |
| `allowManagedPermissionRulesOnly` | Block user/project permission rules |
| `allowManagedMcpServersOnly` | Only admin-approved MCP servers |
| `forceLoginMethod` | Lock authentication method |
| `forceLoginOrgUUID` | Lock to specific org |
| `disableAutoMode` | Prevent auto mode |
| `strictKnownMarketplaces` | Control plugin sources |
| `blockedMarketplaces` | Block specific marketplaces |
