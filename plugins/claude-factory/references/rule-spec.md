# Claude Code Rules Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/memory

## Overview

Rules are modular instruction files that supplement CLAUDE.md. They are loaded into context every session (unconditional) or when matching files are opened (path-scoped).

## Directory Structure

```
.claude/
  CLAUDE.md               # Main project instructions
  rules/
    code-style.md         # Always loaded (no paths frontmatter)
    testing.md            # Always loaded
    security.md           # Always loaded
    frontend/
      react.md            # Can be path-scoped
```

User-level rules: `~/.claude/rules/` — apply to all projects, loaded before project rules.

## Path-Scoped Rules

Use YAML frontmatter with `paths` field:

```yaml
---
paths:
  - "src/api/**/*.ts"
  - "lib/**/*.ts"
---

# API Development Rules
- All endpoints must include input validation
- Use standard error response format
```

## Glob Pattern Syntax

| Pattern | Matches |
|---|---|
| `**/*.ts` | All TypeScript files recursively |
| `src/**/*` | Everything under src/ |
| `*.md` | Markdown files in root |
| `src/components/*.tsx` | TSX files in components/ (not recursive) |
| `*.{ts,tsx}` | Both .ts and .tsx files |

## Loading Behavior

| Type | Loaded When |
|---|---|
| No `paths` field | Unconditionally at session start |
| With `paths` field | When Claude reads files matching the globs |

## Rules vs CLAUDE.md vs Skills

| Mechanism | Loaded | Use For |
|---|---|---|
| CLAUDE.md | Every session, in full | Core project instructions |
| Rules | Every session or on file match | Modular, topic-specific instructions |
| Skills | On invocation or auto-match only | Task-specific workflows, commands |

## Symlinks

`.claude/rules/` supports symlinks for sharing rules across projects:

```bash
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

## Best Practices

- Keep each rule focused on one topic
- Use path-scoping to avoid loading irrelevant rules
- Avoid contradictions between rules and CLAUDE.md
- Use descriptive filenames (the filename is not exposed to Claude, but helps humans)
