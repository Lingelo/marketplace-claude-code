# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A **plugin marketplace** for Claude Code — not a traditional application. There is no build system, no package.json, no test runner. Plugins are metadata-driven (JSON + Markdown) and dynamically loaded by Claude Code.

## Architecture

```
.claude-plugin/marketplace.json   ← Plugin registry (name: "angelo-plugins")
plugins/<name>/
  ├── .claude-plugin/plugin.json  ← Metadata (name, version, description, author)
  ├── README.md
  ├── skills/<name>/SKILL.md      ← User-invocable skills (/command)
  ├── commands/<name>.md           ← Slash commands
  ├── agents/<name>.md             ← Agent system prompts
  ├── hooks/hooks.json             ← PreToolUse/Stop/Notification hooks
  ├── scripts/                     ← Node.js/Bash implementations
  ├── .mcp.json                    ← MCP server definitions
  └── .templates/                  ← Structured output templates
```

## Plugin Types

| Type | Format | Triggered by |
|------|--------|-------------|
| **Skill** | `SKILL.md` with YAML frontmatter | `/command` (e.g. `/commit`, `/push`) |
| **Command** | Markdown with YAML frontmatter | `/command` (e.g. `/epct`) |
| **Agent** | Markdown system prompt | Automatic matching or explicit invocation |
| **Hook** | `hooks.json` → scripts | Tool events (PreToolUse, Stop, Notification) |
| **MCP** | `.mcp.json` | External service integration |

## 7 Plugins

- **security** — Hook blocking sensitive files (.env, keys, credentials). Exit code 2 = block.
- **notifications-system** — System sound & OS notifications on Stop and permission_prompt events.
- **git** — `/commit` (conventional commits + Jira from branch) + `/push` (blocks main/master).
- **playwright** — MCP server + 3 agents (planner, generator, healer) for E2E tests.
- **statusline** — `/statusline-setup` 11-phase wizard for cost/token tracking statusline.
- **experts** — Architect agent (Opus + ultrathink) for deep code analysis.
- **claude-factory** — Meta-plugin for creating Claude Code tools (skills, hooks, agents, commands, rules), CLAUDE.md maintenance, audit, and docs reference.

## Adding a New Plugin

1. Create `plugins/<name>/` with `.claude-plugin/plugin.json`
2. Add skills, commands, agents, hooks, or MCP config as needed
3. Register in `.claude-plugin/marketplace.json` (plugins array)
4. Add a `README.md`

## Key Conventions

- **Plugin JSON schema**: `plugin.json` must have `name`, `version`, `description`, `author`
- **SKILL.md frontmatter**: requires `name`, `description`, `allowed-tools` fields
- **Hook exit codes**: 0 = allow, 2 = block (message on stderr)
- **Hooks over deny rules**: Security uses PreToolUse hooks, not settings.json deny rules (due to [known bugs](https://github.com/anthropics/claude-code/issues/6699))
- **Git commits**: conventional format `<type>(<JIRA>): <description>` — Jira extracted from branch name
- **Cross-platform**: scripts support macOS (afplay/osascript), Linux (paplay/notify-send), Windows (PowerShell)
- **No build step**: everything is interpreted at runtime by Claude Code
