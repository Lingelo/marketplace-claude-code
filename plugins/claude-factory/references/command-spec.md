# Claude Code Command Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/skills

## Overview

Custom commands have been **merged into skills**. Files at `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way. Skills are recommended as they support additional features.

## How Commands Work

- Place `.md` files in `.claude/commands/` or `SKILL.md` in `.claude/skills/<name>/`
- The file name (minus extension) becomes the `/command`
- If a skill and a command share the same name, the skill takes precedence
- Commands support the same YAML frontmatter as skills
- Arguments are available via `$ARGUMENTS` placeholder

## Command Locations

| Location | Path |
|---|---|
| Personal | `~/.claude/commands/<name>.md` |
| Project | `.claude/commands/<name>.md` |
| Plugin | `<plugin>/commands/<name>.md` |

## Frontmatter

Commands use the same frontmatter fields as skills. See `skill-spec.md` for the complete reference.

Minimal example:
```yaml
---
description: What the command does
---
```

## When to Use Commands vs Skills

| Commands | Skills |
|---|---|
| Single file, simple instructions | Multi-file with templates, scripts, examples |
| Quick automation | Complex workflows |
| Legacy/existing | Recommended for new work |

## Built-in Commands

| Command | Purpose |
|---|---|
| `/batch <instruction>` | Parallel codebase changes with worktrees |
| `/claude-api` | Claude API reference material |
| `/debug [description]` | Debug logging and troubleshooting |
| `/loop [interval] <prompt>` | Recurring prompt execution |
| `/simplify [focus]` | Code quality review and fixes |
