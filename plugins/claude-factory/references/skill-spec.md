# Claude Code Skill Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/skills

## Overview

Skills follow the [Agent Skills](https://agentskills.io) open standard. Custom commands (`.claude/commands/`) have been merged into skills — existing command files keep working, but skills are recommended.

## Directory Structure

```
my-skill/
  SKILL.md           # Required — main instructions
  template.md        # Optional template
  examples/
    sample.md
  scripts/
    validate.sh
```

## Skill Locations

| Location | Path | Applies to |
|---|---|---|
| Enterprise | Managed settings | All org users |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where plugin enabled |

Priority: enterprise > personal > project. Plugin skills use `plugin-name:skill-name` namespace.

## Complete Frontmatter Reference

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | No | directory name | Lowercase, hyphens only, max 64 chars |
| `description` | string | Recommended | — | Truncated at 250 chars in listings. Front-load the key use case |
| `argument-hint` | string | No | — | Shown in autocomplete (e.g., `"[issue-number]"`) |
| `disable-model-invocation` | boolean | No | false | Only manual `/invoke`. Use for side-effect workflows |
| `user-invocable` | boolean | No | true | Hide from `/` menu when false |
| `allowed-tools` | string (CSV) | No | all | Tool allowlist when skill is active (e.g., `Read, Grep, Glob`) |
| `model` | string | No | inherited | `sonnet`, `opus`, `haiku`, or full model ID |
| `effort` | string | No | — | `low`, `medium`, `high`, `max` (Opus 4.6 only) |
| `context` | string | No | — | `fork` to run in subagent isolation |
| `agent` | string | No | — | Which subagent when `context: fork` |
| `paths` | string/list | No | — | Glob patterns for auto-activation (e.g., `"src/**/*.ts"`) |
| `shell` | string | No | bash | `bash` or `powershell` |
| `hooks` | object | No | — | Lifecycle hooks scoped to this skill (same format as hooks.json) |

## String Substitutions

| Variable | Description |
|---|---|
| `$ARGUMENTS` | All arguments passed to skill |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing the SKILL.md |

## Dynamic Context Injection

Shell commands with `` !`command` `` syntax run **before** Claude sees the content:

```yaml
---
name: pr-summary
context: fork
agent: Explore
---
PR diff: !`gh pr diff`
Changed files: !`gh pr diff --name-only`
```

## Best Practices

- Keep SKILL.md under 500 lines. Move detailed reference to separate files
- Front-load the key use case in descriptions (truncated at 250 chars)
- Use `disable-model-invocation: true` for side-effect workflows (deploy, commit)
- Use `user-invocable: false` for background knowledge only Claude should use
- Reference supporting files from SKILL.md so Claude knows when to load them
- Include "ultrathink" in content to enable extended thinking
- Use `@path/to/file` imports to reference other files relative to the SKILL.md
