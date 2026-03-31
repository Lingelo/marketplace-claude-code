---
date: 2026-03-31
topic: plugin-cleanup
---

# Plugin Cleanup: Remove 6 Obsolete/Redundant Plugins

## Problem Frame

The marketplace has 13 plugins, but 6 are dead weight: stubs never completed, thin MCP proxies that add no logic, a wrapper on an external CLI, and a workflow plugin superseded by compound-engineering. They inflate the plugin count, bloat CLAUDE.md context, and create a false impression of functionality.

## Requirements

- R1. Delete plugin directories: `plugins/maintenance`, `plugins/figma`, `plugins/atlassian`, `plugins/notifications-peon-ping`, `plugins/workflows`, `plugins/release-note`
- R2. Remove all 6 entries from `.claude-plugin/marketplace.json`
- R3. Update the "Plugins" section of `CLAUDE.md` to list only the 7 surviving plugins with accurate descriptions
- R4. Update `marketplace.json` owner metadata (currently placeholder `your-team` / `contact@example.com`)

## Success Criteria

- marketplace.json contains exactly 7 plugin entries
- CLAUDE.md plugin section matches marketplace.json (7 plugins listed)
- No dangling references to removed plugins anywhere in the repo
- Owner metadata in marketplace.json reflects actual author info

## Scope Boundaries

- No new plugins created
- No changes to surviving plugins' internals
- No MCP config migration (Atlassian and Figma configs are simply removed, not relocated)

## Key Decisions

- **release-note removed** even though it was functional: user doesn't need it, and it eliminates the Atlassian MCP dependency question
- **Figma MCP not relocated**: not actively used, simply removed
- **Atlassian MCP not relocated**: no remaining plugin depends on it after release-note removal
- **notifications-peon-ping removed**: PeonPing CLI can be installed directly without a marketplace wrapper

## Next Steps

-> `/ce:plan` for structured implementation planning
