---
title: "Building a Claude Code meta-plugin: architecture decisions and allowed-tools pitfall"
category: logic-errors
date: 2026-03-30
tags: [claude-code, plugin-development, skill-authoring, allowed-tools, frontmatter, meta-plugin]
components: [claude-factory, skills, hooks, agents]
severity: medium
resolution_time: session
---

# allowed-tools Frontmatter / Body Mismatch

**Category:** logic-errors
**Severity:** Silent failure — skill prescribes behavior it cannot execute
**Applies to:** Any SKILL.md with `allowed-tools` in YAML frontmatter

## Problem

When a SKILL.md body references tools (e.g., `Edit`, `AskUserQuestion`) that are not listed in the `allowed-tools` frontmatter field, Claude Code silently ignores those tool invocations. The skill appears to work but skips actions it was designed to perform.

This commonly occurs when modifying a skill's body to add new workflow steps (e.g., an update mode using `Edit`, or interactive clarification using `AskUserQuestion`) without updating the frontmatter accordingly.

## Root Cause

`allowed-tools` acts as a hard allowlist. If specified, ONLY listed tools are available to the skill at runtime. The frontmatter and body are not validated against each other — there is no built-in consistency check. This is a classic "interface contract drift" bug: the body evolves independently from its metadata header.

## Investigation Steps

1. Pattern recognition review caught that 4 skills (`skill`, `agent`, `command`, `rule`) had Update Workflow sections saying "Use `Edit` (not Write)" but `Edit` was not in their `allowed-tools`
2. Same review found `claude-md` skill said "Ask before applying changes" but lacked `AskUserQuestion`
3. This was a systematic issue — subagents that added the update mode modified the skill body but did not check frontmatter consistency
4. The bug is silent: Claude simply never invokes the forbidden tool, so the skill appears to work but skips the edit/question steps entirely

## Working Solution

Add every tool referenced in the skill body to the `allowed-tools` frontmatter. The general rule: **any tool name that appears as an instruction in the skill body MUST appear in `allowed-tools`**.

```yaml
# Before (broken — Edit and AskUserQuestion used in body but not allowed)
allowed-tools: Read, Write, Glob, Grep, Bash

# After (fixed)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
```

Alternative: if the skill needs broad tool access, **omit `allowed-tools` entirely**. Per the Claude Code spec, omitting the field means "all tools available."

## Detection

Symptoms of this bug:
- Skill runs but silently skips steps
- No error messages — the tool call simply does not happen
- Partial completion of multi-step workflows

Manual check:
```bash
# Find tools referenced in body but potentially missing from frontmatter
grep -E '(Edit|Write|Read|Bash|Glob|Grep|Agent|AskUserQuestion|WebFetch|WebSearch)' plugins/*/skills/*/SKILL.md
```

Automated: run `/factory:audit` on the skill — the audit validates `allowed-tools` against known tool names and can be extended to cross-reference body usage.

## Prevention Strategies

### 1. Frontmatter-body consistency check
After modifying a SKILL.md body, grep for tool names and verify each appears in `allowed-tools` (if that field is specified).

### 2. Audit as validation gate
Run `/factory:audit` on any modified skill. Extend the audit to cross-reference tool usage patterns in the body against the `allowed-tools` list.

### 3. Subagent instruction pattern
When dispatching subagents to modify SKILL.md files, explicitly instruct them:
> "If you add tool usage to the body, also update the `allowed-tools` frontmatter."

### 4. Omit `allowed-tools` when not restricting
Only specify `allowed-tools` when intentionally restricting the tool set. For skills that need broad tool access, omitting the field entirely eliminates this class of bug.

## Architecture Learnings (from this session)

### Decisions that worked well
1. **Separate skills over router pattern** — one skill per sub-command, consistent with marketplace conventions, better context efficiency
2. **Shared references via `@../../references/` imports** — DRY for spec content across skills
3. **Templates with `{{PLACEHOLDER}}` syntax** — unambiguous, LLM-friendly, no collision with runtime interpolation
4. **Hybrid interactive model** — description libre first, `AskUserQuestion` only for unresolved decisions

### Decisions to reconsider
1. **Context detection duplicated across 6 skills** (~30 lines each) — extract to shared `references/factory-protocol.md`
2. **`/factory:command` generates deprecated artifacts** — commands are merged into skills per official spec
