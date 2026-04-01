---
name: dream
description: Consolidate and clean up CLAUDE.md and memory files — remove duplicates, resolve contradictions, verify referenced files exist, merge similar rules. Inspired by the autoDream pattern. Triggers on /factory:dream.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# Factory: Dream — Memory Consolidation

Official specification: @../../references/claude-md-spec.md
Rules specification: @../../references/rule-spec.md

## Usage

```
/factory:dream                    # Consolidate project CLAUDE.md + rules
/factory:dream --global           # Include ~/.claude/CLAUDE.md
/factory:dream --dry-run          # Report only, no modifications
```

`$ARGUMENTS` may contain `--global` and/or `--dry-run` flags.

## Context

Over time, CLAUDE.md files and `.claude/rules/` accumulate duplicate instructions, stale references, and contradictions. This skill performs a "dream consolidation" — scanning, deduplicating, and cleaning up memory files like the autoDream pattern described in Claude Code internals.

## Step 1: Discover Memory Files

Scan all instruction sources:

```bash
# Project CLAUDE.md files
find . -name "CLAUDE.md" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null

# Project rules
ls .claude/rules/*.md 2>/dev/null

# Global (if --global flag)
ls ~/.claude/CLAUDE.md 2>/dev/null
ls ~/.claude/rules/*.md 2>/dev/null
```

Read each file completely. Build a map: `{ file_path: content, line_count }`.

Report: "Found N instruction files (X total lines)."

## Step 2: Deduplication Analysis

For each file, compare instructions line-by-line and semantically:

### Exact Duplicates
- Identical lines appearing in multiple files or multiple times in the same file
- Identical rules in different `.claude/rules/` files

### Near-Duplicates (semantic)
- Instructions saying the same thing differently:
  - "Use 2-space indentation" vs "Indent with 2 spaces"
  - "No console.log in production" vs "Remove console.log before committing"
- Same rule in CLAUDE.md AND in a rules/ file (redundant — the rules/ file is sufficient)

### Detection approach
- Group instructions by topic (testing, formatting, git, security, architecture, etc.)
- Within each group, compare for overlap
- Flag pairs with >80% semantic similarity

## Step 3: Contradiction Detection

Scan for instructions that conflict with each other:

### Common contradiction patterns
| Pattern A | Pattern B | Conflict |
|-----------|-----------|----------|
| "Use tabs" | "Use spaces" | Indentation conflict |
| "Use single quotes" | "Use double quotes" | Quote style conflict |
| "Max 80 chars per line" | "Max 120 chars per line" | Line length conflict |
| "Always add comments" | "Avoid unnecessary comments" | Comment policy conflict |
| "Use async/await" | "Use callbacks" | Async pattern conflict |
| "Use named exports" | "Use default exports" | Export style conflict |
| Model-specific contradictions | e.g., "@[OPUS-4.6] use X" vs "@[SONNET-4.6] use Y" | Resolve based on current model |

### Detection approach
- Identify imperative instructions (those starting with "Use", "Always", "Never", "Avoid", "Prefer", "Max", "Min")
- Group by topic
- Check for opposing directives within the same topic

## Step 4: Staleness Check

Verify that referenced files and paths still exist:

### Checks
| Reference Type | How to Verify | Severity |
|---|---|---|
| `@path/to/file` imports | File exists (`ls path/to/file`) | Error if missing |
| File paths mentioned in instructions | File/directory exists | Warning if missing |
| Tool/command references | Tool name is valid | Info |
| Package references | Package in package.json / requirements.txt | Warning if removed |
| URL references | Not checked (would need network) | Skip |

### Additional staleness signals
- Instructions referencing deleted features or old file structure
- Rules for frameworks/tools not in the project anymore
- @[MODEL] tags for models older than the current one

## Step 5: Size Analysis

| Check | Threshold | Action |
|---|---|---|
| Single CLAUDE.md > 200 lines | Warning | Suggest splitting into rules/ files |
| Total instruction lines > 500 | Warning | Suggest consolidation |
| rules/ directory > 20 files | Info | Suggest merging related rules |
| Deeply nested imports (> 3 levels) | Warning | Suggest flattening |

## Step 6: Generate Report

```
Dream Consolidation Report
==========================
Files scanned: N (M total lines)

Duplicates Found: X
  - [D1] CLAUDE.md:15 ≈ .claude/rules/style.md:3 — "Use 2-space indentation"
  - [D2] CLAUDE.md:42 = CLAUDE.md:78 — Identical line

Contradictions Found: Y
  - [C1] CLAUDE.md:10 vs .claude/rules/format.md:5 — "tabs" vs "spaces"

Stale References: Z
  - [S1] CLAUDE.md:25 — @src/legacy/auth.js — file does not exist
  - [S2] .claude/rules/api.md:8 — references "express" but package.json has "fastify"

Size Warnings: W
  - [SZ1] CLAUDE.md — 287 lines (recommended: < 200)

Suggested Actions:
  1. Remove 3 duplicate instructions
  2. Resolve 1 contradiction (choose tabs or spaces)
  3. Remove 2 stale file references
  4. Split CLAUDE.md into topic rules/ files
```

## Step 7: Apply Changes (if not --dry-run)

Ask: "Apply which changes? (all / duplicates / contradictions / stale / specific numbers / none)"

For each approved action:
1. **Duplicates**: Keep the version in the most specific location (rules/ > CLAUDE.md), remove the other
2. **Contradictions**: Ask user which instruction to keep
3. **Stale references**: Remove the reference line or update the path
4. **Size**: Offer to extract sections into `.claude/rules/` files with proper path-scoping

After applying changes, show a summary:
```
Applied N changes:
  - Removed X duplicate instructions
  - Resolved Y contradictions
  - Cleaned Z stale references
  - Total lines: M → K (saved N lines)
```
