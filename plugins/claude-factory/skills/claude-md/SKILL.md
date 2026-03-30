---
name: claude-md
description: Analyze, optimize, or generate CLAUDE.md files following official Anthropic best practices. Use when maintaining project instructions, checking CLAUDE.md quality, or creating new CLAUDE.md files. Triggers on /factory:claude-md.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Factory: CLAUDE.md Maintenance

Official specification: @../../references/claude-md-spec.md
Rules specification: @../../references/rule-spec.md

## Usage

```
/factory:claude-md                    # Analyze nearest CLAUDE.md
/factory:claude-md path/to/CLAUDE.md  # Analyze specific file
/factory:claude-md --generate         # Generate new CLAUDE.md from project analysis
```

## Step 1: Determine Mode

Parse `$ARGUMENTS`:
- **No arguments**: Find and analyze the nearest CLAUDE.md
- **Path argument**: Analyze the specified CLAUDE.md
- **`--generate` flag**: Generate a new CLAUDE.md from scratch

### Find Nearest CLAUDE.md

```bash
# Check common locations in order
for f in ./CLAUDE.md ./.claude/CLAUDE.md ../CLAUDE.md; do
  [ -f "$f" ] && echo "$f" && break
done
```

If no CLAUDE.md found, switch to generation mode automatically.

## Step 2A: Analyze Existing CLAUDE.md

Read the file completely, then evaluate against these criteria:

### Structure Check

| Check | Rule | Severity |
|---|---|---|
| Line count | Target under 200 lines | Warning if >200, Error if >400 |
| Markdown structure | Uses headers (##) and bullets | Warning if flat text |
| Section organization | Related instructions grouped | Info |

### Content Quality

| Check | Rule | Severity |
|---|---|---|
| Specificity | Instructions are verifiable ("use 2-space indent" not "format nicely") | Warning |
| Contradictions | No conflicting instructions within the file | Error |
| Duplication | No repeated information | Warning |
| Staleness | References to files/tools that exist | Warning (check with Glob) |

### Import Analysis

| Check | Rule | Severity |
|---|---|---|
| `@` imports | All imported files exist | Error if missing |
| Useful imports | README, package.json, key config files referenced | Info |
| Circular imports | No import cycles | Error |
| Import depth | Max 5 hops | Warning |

### Rules Integration

Check if `.claude/rules/` exists and is being used:
```bash
ls .claude/rules/ 2>/dev/null
```

| Check | Rule | Severity |
|---|---|---|
| Rules directory | Exists if project has topic-specific instructions | Info |
| Modularization | Long CLAUDE.md sections could be rules instead | Info |
| Path-scoped rules | Framework/directory-specific instructions should be scoped rules | Info |

### Best Practice Compliance

| Practice | Description |
|---|---|
| Project-specific | Only includes what makes THIS project unique |
| No file listings | Doesn't list every file (Claude can explore) |
| No duplication | Doesn't repeat README/package.json content — imports instead |
| Actionable | Every instruction is something Claude can act on |
| HTML comments | Uses `<!-- -->` for human-only notes (stripped before injection) |

## Step 3A: Generate Report

Present findings as a structured report:

```
CLAUDE.md Analysis: <path>
Lines: <count> (<ok | warning: over 200>)

Errors (must fix):
  - [E1] <description>
  - [E2] <description>

Warnings (should fix):
  - [W1] <description>
  - [W2] <description>

Suggestions (nice to have):
  - [S1] <description>
  - [S2] <description>
```

Then offer concrete fixes:
- For each error/warning, propose the specific edit
- For restructuring, show the proposed new structure
- Ask before applying changes

## Step 2B: Generate New CLAUDE.md

When generating from scratch:

### Project Analysis

Scan the project to understand its nature:

```bash
# Detect project type
ls package.json Gemfile requirements.txt Cargo.toml go.mod pyproject.toml pom.xml 2>/dev/null

# Detect frameworks
ls -d .next .nuxt angular.json vite.config.* webpack.config.* rails app manage.py 2>/dev/null

# Check for existing config
ls .eslintrc* .prettierrc* tsconfig.json .rubocop.yml 2>/dev/null

# Check for CI/CD
ls .github/workflows/*.yml .gitlab-ci.yml Jenkinsfile 2>/dev/null

# Check for tests
ls -d test tests spec __tests__ 2>/dev/null

# Git info
git remote get-url origin 2>/dev/null
```

### Generate CLAUDE.md

Create a CLAUDE.md following the official structure:

```markdown
# CLAUDE.md

## What This Is

<One-line description of the project>

## Quick Start

<How to install, build, run, and test — commands only, no explanations>

## Architecture

<Brief overview of project structure — only what's non-obvious>

## Key Conventions

<Project-specific rules that Claude should follow>

## Common Tasks

<Frequent operations and how to perform them>
```

**Guidelines:**
- Target 50-150 lines (enough to be useful, not bloated)
- Import rather than duplicate: `@README.md` for project overview, `@package.json` for commands
- Be specific and verifiable
- Only include what makes this project unique
- Use rules (`/.claude/rules/`) for modular instructions if needed

## Step 4: Post-Action Summary

```
CLAUDE.md <analyzed | generated>: <path>
Lines: <count>
Errors: <count> | Warnings: <count> | Suggestions: <count>

<If generated: "Review the file and customize for your project.">
<If analyzed: "Run the suggested fixes? (y/n)">
```
