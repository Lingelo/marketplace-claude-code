# Claude Code Plugin Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/plugins-reference

## Overview

Plugins extend Claude Code with skills, hooks, agents, MCP servers, and commands. They are distributed via marketplaces.

## Plugin Directory Structure

```
my-plugin/
  .claude-plugin/plugin.json  # Required — metadata
  README.md                    # Recommended
  skills/<name>/SKILL.md       # User-invocable skills
  commands/<name>.md            # Slash commands
  agents/<name>.md              # Agent system prompts
  hooks/hooks.json              # Event hooks
  scripts/                      # Implementation scripts
  .mcp.json                     # MCP server definitions
  .templates/                   # Structured output templates
```

## plugin.json Schema

```json
{
  "name": "my-plugin",
  "description": "What the plugin does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "email@example.com"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Plugin identifier (kebab-case) |
| `description` | string | Yes | One-line description |
| `version` | string | Yes | Semver version |
| `author.name` | string | Yes | Author name |
| `author.email` | string | No | Author email |

## Marketplace Registry (marketplace.json)

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "marketplace-name",
  "owner": {
    "name": "Owner Name",
    "email": "email@example.com"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin",
      "description": "What it does",
      "category": "development"
    }
  ]
}
```

| Category | Description |
|---|---|
| `security` | Security and access control |
| `development` | Development tools and workflows |
| `productivity` | Productivity and automation |
| `integration` | External service integrations |

## Plugin Skill Namespace

Plugin skills are invoked as `plugin-name:skill-name`. Example: `claude-factory:skill` -> `/factory:skill`.

## Plugin Constraints

- Plugin subagents do **not** support `hooks`, `mcpServers`, or `permissionMode`
- Hook scripts should use `${CLAUDE_PLUGIN_ROOT}` for relative paths
- Plugin data persists at `${CLAUDE_PLUGIN_DATA}`
- No build step — everything is interpreted at runtime
