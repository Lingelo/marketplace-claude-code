# Claude Code Agent (Subagent) Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/sub-agents

## Overview

Agents are reusable personas with specialized tools, models, and behaviors. They run as subagents — isolated contexts that cannot spawn other subagents (no nesting).

## Agent File Locations

| Location | Scope | Priority |
|---|---|---|
| `--agents` CLI flag (JSON) | Current session | 1 (highest) |
| `.claude/agents/` | Project | 2 |
| `~/.claude/agents/` | All projects | 3 |
| Plugin `agents/` directory | Where plugin enabled | 4 (lowest) |

## Complete Frontmatter Reference

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | Yes | — | Unique identifier (lowercase, hyphens) |
| `description` | string | Yes | — | When Claude should delegate to this agent |
| `tools` | string (CSV) | No | all inherited | Allowlist of tools |
| `disallowedTools` | string (CSV) | No | — | Denylist, removed from inherited set |
| `model` | string | No | `inherit` | `sonnet`, `opus`, `haiku`, full model ID, or `inherit` |
| `permissionMode` | string | No | `default` | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | number | No | — | Max agentic turns before stop |
| `memory` | string | No | — | `user`, `project`, or `local` for persistent memory |
| `background` | boolean | No | false | Always run in background |
| `effort` | string | No | — | `low`, `medium`, `high`, `max` |
| `isolation` | string | No | — | `worktree` for isolated git worktree |
| `skills` | list | No | — | Skills preloaded at startup (full content injected) |
| `mcpServers` | list | No | — | MCP servers (inline def or string reference) |
| `hooks` | object | No | — | Lifecycle hooks scoped to this agent |
| `initialPrompt` | string | No | — | Auto-submitted first user turn when running as main agent |

## Built-in Subagents

| Agent | Model | Tools | Purpose |
|---|---|---|---|
| `Explore` | Haiku | Read-only | Fast codebase search and analysis |
| `Plan` | Inherited | Read-only | Research for plan mode |
| `general-purpose` | Inherited | All | Complex multi-step tasks |
| `Bash` | Inherited | Terminal | Running commands in separate context |

## Key Constraints

- Subagents **cannot spawn other subagents** (no nesting)
- Plugin subagents do **not** support `hooks`, `mcpServers`, or `permissionMode` (security restriction)
- Use `Agent(worker, researcher)` in `tools` to restrict which subagents can be spawned

## Invocation Methods

1. **Automatic** — Claude delegates based on description matching
2. **Natural language** — "Use the code-reviewer subagent to..."
3. **@-mention** — `@"code-reviewer (agent)"` guarantees that agent runs
4. **Session-wide** — `claude --agent code-reviewer` or `"agent": "code-reviewer"` in settings

## System Prompt Guidelines

- Start with a clear role definition ("You are a...")
- Define the scope and constraints explicitly
- Include examples of expected behavior
- Specify output format when relevant
- Keep prompts focused — one agent, one responsibility
