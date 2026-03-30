---
name: docs
description: Quick reference lookup for Claude Code official specifications — skills, hooks, agents, rules, settings, CLAUDE.md. Use when you need to check frontmatter fields, hook events, exit codes, or any Claude Code spec. Triggers on /factory:docs.
allowed-tools: Read, Glob, Grep
---

# Factory: Documentation Reference

All specifications:
@../../references/skill-spec.md
@../../references/hook-spec.md
@../../references/agent-spec.md
@../../references/command-spec.md
@../../references/rule-spec.md
@../../references/settings-spec.md
@../../references/claude-md-spec.md
@../../references/plugin-spec.md

## Usage

```
/factory:docs "query"
/factory:docs "skill frontmatter fields"
/factory:docs "hook events that can block"
/factory:docs "agent frontmatter"
/factory:docs "permission rules syntax"
/factory:docs "CLAUDE.md imports"
```

`$ARGUMENTS` contains the user's query in natural language.

## Step 1: Parse Query

If `$ARGUMENTS` is empty, show available topics:

```
Claude Code Documentation Reference (March 2026)

Available topics:
  skills    — Frontmatter fields, string substitutions, dynamic context, best practices
  hooks     — 25+ events, 4 hook types, exit codes, JSON output schema, env vars
  agents    — Frontmatter fields, built-in agents, constraints, invocation methods
  commands  — Format, relation with skills, built-in commands
  rules     — Path-scoping, glob patterns, loading behavior
  settings  — Permission rules, hooks config, managed settings
  claude-md — File locations, imports, writing guidelines
  plugins   — plugin.json schema, marketplace registration, namespacing

Usage: /factory:docs "your question"
```

## Step 2: Route to Reference

Match the query to the most relevant reference file(s):

| Query Keywords | Reference File |
|---|---|
| skill, frontmatter, SKILL.md, allowed-tools, paths, context fork | skill-spec.md |
| hook, event, PreToolUse, PostToolUse, Stop, Notification, exit code, block | hook-spec.md |
| agent, subagent, model, maxTurns, tools, isolation, worktree | agent-spec.md |
| command, slash command, commands directory | command-spec.md |
| rule, rules, path-scoped, glob, .claude/rules | rule-spec.md |
| settings, permissions, allow, deny, settings.json | settings-spec.md |
| CLAUDE.md, memory, imports, @path, instructions | claude-md-spec.md |
| plugin, plugin.json, marketplace, marketplace.json, category | plugin-spec.md |

If the query spans multiple domains, load multiple references.

## Step 3: Answer the Query

Using the loaded reference(s), answer the user's question directly:

- **For "list all X"** queries: extract and present the complete list/table from the reference
- **For "how to X"** queries: provide the relevant section with examples
- **For "what is X"** queries: provide the definition and context
- **For comparison queries**: present a comparison table

**Format rules:**
- Lead with the direct answer
- Include the relevant table or code block from the reference
- Add a brief note about where to find more detail
- Keep responses focused — don't dump the entire reference file

## Examples

**Query**: "hook events that can block"

**Response**:
```
Events that can block actions (exit code 2 or JSON decision):

| Event | Matcher | Description |
|---|---|---|
| UserPromptSubmit | — | Before user prompt is processed |
| PreToolUse | Tool name regex | Before a tool executes |
| PermissionRequest | Tool name | When tool requests permission |
| SubagentStop | Agent type | When subagent finishes |
| Stop | — | When Claude finishes a turn |
| TeammateIdle | — | When teammate becomes idle |
| TaskCreated | — | When task is created |
| TaskCompleted | — | When task completes |
| ConfigChange | Setting type | When config changes |
| WorktreeCreate | — | Worktree creation |

Source: hook-spec.md
```

**Query**: "skill frontmatter fields"

**Response**: Present the complete frontmatter table from skill-spec.md.

**Query**: "permission rules syntax"

**Response**: Present the permission rules section from settings-spec.md with examples.
