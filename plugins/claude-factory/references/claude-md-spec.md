# CLAUDE.md Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/memory

## Overview

CLAUDE.md files provide persistent instructions to Claude Code. Claude walks up the directory tree from CWD, loading every CLAUDE.md it finds. Subdirectory CLAUDE.md files load on demand.

## File Locations and Precedence (highest to lowest)

| Scope | Location | Shared with |
|---|---|---|
| Managed policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux: `/etc/claude-code/CLAUDE.md` | All users (org-wide, cannot be excluded) |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team via version control |
| User | `~/.claude/CLAUDE.md` | Just you, all projects |

## Imports

Use `@path/to/file` syntax to pull in external files. Relative paths resolve from the importing file.

```markdown
See @README for project overview and @package.json for available commands.
@~/.claude/my-project-instructions.md
```

Maximum import depth: 5 hops.

## AGENTS.md Compatibility

If your repo already has `AGENTS.md`, create a `CLAUDE.md` that imports it:

```markdown
@AGENTS.md

## Claude Code
Use plan mode for changes under `src/billing/`.
```

## Writing Effective Instructions

- **Target under 200 lines** per file. Longer files consume context and reduce adherence
- **Use markdown headers and bullets** to group related instructions
- **Be specific and verifiable**: "Use 2-space indentation" not "Format code properly"
- **Avoid contradictions** across files — Claude picks arbitrarily when rules conflict
- **HTML comments** (`<!-- ... -->`) are stripped before injection — use for human-only notes

## Auto Memory

Enabled by default (v2.1.59+). Claude saves learnings to `~/.claude/projects/<project>/memory/MEMORY.md`. First 200 lines or 25KB loaded per session.

Toggle with `/memory` or `"autoMemoryEnabled": false` in settings.

## Key Commands

| Command | Description |
|---|---|
| `/init` | Generate a starting CLAUDE.md automatically |
| `/memory` | View all loaded instruction files and manage auto memory |

## Best Practices

- Keep CLAUDE.md focused on what makes THIS project unique
- Don't duplicate information available in README or package.json — import instead
- Use rules (`/.claude/rules/`) for modular, topic-specific instructions
- Put path-specific guidance in rules with `paths` frontmatter instead of cluttering CLAUDE.md
- Avoid listing every file in the project — Claude can explore the codebase
