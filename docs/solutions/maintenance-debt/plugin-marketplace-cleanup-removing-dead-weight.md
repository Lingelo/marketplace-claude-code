---
title: "Marketplace Plugin Cleanup: Removed 6 Dead-Weight Plugins"
category: maintenance-debt
date: 2026-03-31
severity: medium
tags:
  - tech-debt
  - plugin-registry
  - context-optimization
  - marketplace-curation
components:
  - plugin-marketplace
  - .claude-plugin/marketplace.json
  - CLAUDE.md
---

# Marketplace Plugin Cleanup: Removed 6 Dead-Weight Plugins

## Problem

The Claude Code plugin marketplace accumulated 13 plugins, but only 7 were actively used and production-grade. Six plugins were dead weight:

| Plugin | Type | Why Dead Weight |
|--------|------|----------------|
| `maintenance` | Stub | 81-line prompt with no implementation |
| `figma` | MCP proxy | Just `.mcp.json` + README, no workflows |
| `atlassian` | MCP proxy | Just `.mcp.json` + README, no workflows |
| `notifications-peon-ping` | CLI wrapper | Only calls external PeonPing CLI |
| `workflows` | Obsolete | Fully superseded by compound-engineering |
| `release-note` | Unused | Not actively used, eliminated Atlassian dependency |

**Symptoms:** inflated context window, misleading plugin count (13 vs 7 real), maintenance surface for non-functional code.

## Root Cause

No quality gate for plugin inclusion and no periodic audit process. Plugins were created for "completeness" (MCP proxies), left as stubs (maintenance), or became obsolete when better alternatives appeared (workflows → compound-engineering).

## Investigation

1. **Ideation audit** — `/ce:ideate` generated 48 improvement ideas; plugin audit surfaced as a priority
2. **Per-plugin substance check** — examined each plugin's actual implementation (skills, hooks, scripts, agents)
3. **Classification** — categorized as: production-ready (7), stub (1), MCP proxy (2), CLI wrapper (1), obsolete (1), unused (1)
4. **Dependency analysis** — release-note depended on atlassian MCP; removing both eliminates the dependency chain. Figma MCP had no dependents.
5. **Reference scan** — grep across all tracked files for dangling references (marketplace.json, CLAUDE.md, README.md, notifications-system README)

## Solution

### 1. Delete plugin directories

```bash
git rm -r plugins/maintenance plugins/figma plugins/atlassian \
  plugins/notifications-peon-ping plugins/workflows plugins/release-note
```

### 2. Update registry (`.claude-plugin/marketplace.json`)

Remove 6 entries, keep 7: `security`, `notifications-system`, `git`, `playwright`, `statusline`, `experts`, `claude-factory`.

### 3. Update documentation

- `CLAUDE.md`: "13 Plugins" → "7 Plugins", remove 6 descriptions
- `README.md`: update table, installation commands, usage sections, structure tree
- `notifications-system/README.md`: remove mutual exclusivity note about peon-ping

### 4. Verify

```bash
# Check for dangling references
grep -r "maintenance\|notifications-peon-ping\|workflows\|release-note\|figma\|atlassian" \
  --include="*.md" --include="*.json" .

# Validate JSON
python3 -c "import json; d=json.load(open('.claude-plugin/marketplace.json')); print(len(d['plugins']), 'plugins')"

# Count consistency
grep -c '^\- \*\*' CLAUDE.md  # Should match 7 in plugin section
```

## Key Decisions

- **MCP proxies removed, not relocated** — Figma and Atlassian MCPs can be configured directly in target projects without marketplace wrappers
- **release-note removed** — eliminates the Atlassian MCP dependency question entirely
- **workflows removed** — compound-engineering provides superior EPCT, brainstorm, plan, and work workflows
- **notifications-peon-ping removed** — PeonPing CLI installable directly; wrapper added no value

## Prevention

### Quality bar for new plugins

A plugin must provide **at least one** of:
- Callable skill with real logic (not just docs)
- Runtime hook with script implementation
- Agent with substantial system prompt
- MCP server with custom workflows (not just a proxy)

**Disqualifying signals:** MCP-only proxy, "Coming Soon" sections, placeholder metadata, duplicate of native Claude Code feature.

### Periodic audit signals

- Zero invocations in 6+ months → archive candidate
- Thin wrapper around external tool → evaluate if wrapper adds value
- Superseded by newer tool → remove, don't maintain both
- Stub/placeholder → complete or remove

### Decision tree: plugin vs documentation

```
Does it execute code at runtime? (hook, skill, MCP with workflows)
├─ YES + adds behavior Claude Code doesn't have natively → REAL PLUGIN
├─ YES but duplicates native feature → Document in CLAUDE.md instead
└─ NO (just metadata + docs) → Add to README, not marketplace
```

## Related

- [allowed-tools frontmatter/body mismatch](../logic-errors/allowed-tools-frontmatter-body-mismatch.md) — related plugin quality issue
- [Cleanup requirements](../../brainstorms/2026-03-31-plugin-cleanup-requirements.md) — decision rationale
- [Cleanup plan](../../plans/2026-03-31-001-refactor-remove-obsolete-plugins-plan.md) — implementation plan
