---
title: "refactor: Remove 6 obsolete/redundant plugins"
type: refactor
status: completed
date: 2026-03-31
origin: docs/brainstorms/2026-03-31-plugin-cleanup-requirements.md
---

# refactor: Remove 6 obsolete/redundant plugins

## Overview

The marketplace has 13 plugins but 6 are dead weight: a stub never completed (maintenance), two thin MCP proxies (figma, atlassian), a CLI wrapper (notifications-peon-ping), a workflow superseded by compound-engineering (workflows), and a Jira skill no longer needed (release-note). Removing them brings the marketplace to 7 focused, production-grade plugins.

## Problem Statement / Motivation

Plugin bloat inflates CLAUDE.md context window, creates false impressions of functionality, and adds maintenance surface for code that delivers no value. The user confirmed each removal during ideation (see origin: `docs/brainstorms/2026-03-31-plugin-cleanup-requirements.md`).

## Plugins to Remove

| Plugin | Reason |
|--------|--------|
| `maintenance` | Stub — 81-line prompt with no implementation |
| `figma` | Pure MCP proxy — just a `.mcp.json` + README |
| `atlassian` | Pure MCP proxy — just a `.mcp.json` + README |
| `notifications-peon-ping` | Thin wrapper — only calls external PeonPing CLI |
| `workflows` | Obsolete — fully superseded by compound-engineering |
| `release-note` | No longer needed — user doesn't use it |

## Plugins Surviving (7)

`security`, `notifications-system`, `git`, `playwright`, `statusline`, `experts`, `claude-factory`

## Acceptance Criteria

- [ ] 6 plugin directories deleted from `plugins/`
- [ ] `marketplace.json` contains exactly 7 plugin entries
- [ ] `marketplace.json` owner metadata updated (no more placeholder)
- [ ] `CLAUDE.md` plugin section lists exactly 7 plugins
- [ ] `README.md` updated: table, installation, examples, MCP section, structure tree
- [ ] `notifications-system/README.md` mutual exclusivity note cleaned up
- [ ] No dangling references to deleted plugins in any tracked file
- [ ] Single atomic commit

## Implementation Plan

### Phase 1: Delete plugin directories

```bash
git rm -r plugins/maintenance plugins/figma plugins/atlassian plugins/notifications-peon-ping plugins/workflows plugins/release-note
```

### Phase 2: Update `.claude-plugin/marketplace.json`

1. Remove 6 plugin entries from `plugins` array
2. Update `owner.name` from `"your-team"` → actual author name
3. Update `owner.email` from `"contact@example.com"` → actual email
4. Verify valid JSON with 7 entries

### Phase 3: Update `CLAUDE.md`

1. Change `## 13 Plugins` → `## 7 Plugins`
2. Remove 6 bullet points for deleted plugins
3. Keep descriptions for 7 surviving plugins

### Phase 4: Update `README.md`

Files and sections to modify:

1. **Plugin table** (lines 7-21): Remove 6 rows for deleted plugins
2. **Installation section** (lines 45-61): Remove install commands for deleted plugins, remove mutual exclusivity comment for peon-ping
3. **Workflow EPCT section** (lines 113-122): Delete entirely
4. **Release Notes section** (lines 124-132): Delete entirely
5. **Maintenance section** (lines 150-154): Delete entirely
6. **Plugins MCP table** (lines 156-177): Remove atlassian and figma rows, remove their install examples. Keep playwright row.
7. **Structure tree** (lines 181-198): Remove 6 plugin directory entries

### Phase 5: Update `plugins/notifications-system/README.md`

Remove or update the mutual exclusivity note about `notifications-peon-ping` (line 5) since that plugin no longer exists.

### Phase 6: Verify

1. `grep -r` for any remaining references to deleted plugin names across tracked files
2. Validate `marketplace.json` is valid JSON
3. Confirm plugin count: 7 in marketplace.json, 7 in CLAUDE.md, 7 rows in README.md table

## Scope Boundaries

- No changes to surviving plugins' internals
- No new plugins created
- No MCP config migration (configs are simply deleted with their plugins)
- `.claude/settings.local.json` is NOT tracked by git — out of scope
- `docs/brainstorms/` requirements doc is kept as historical record

## Sources

- **Origin document:** [docs/brainstorms/2026-03-31-plugin-cleanup-requirements.md](docs/brainstorms/2026-03-31-plugin-cleanup-requirements.md) — key decisions: release-note removed (eliminates atlassian dep), figma MCP not relocated, peon-ping CLI usable without wrapper
