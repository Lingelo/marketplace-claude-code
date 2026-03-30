---
name: rule
description: Scaffold a Claude Code rule (.claude/rules/) from a natural language description. Use when creating project rules, coding standards, or path-scoped instructions. Triggers on /factory:rule.
allowed-tools: Read, Write, Glob, Grep, Bash
---

# Factory: Create Rule

Official specification: @../../references/rule-spec.md

## Usage

```
/factory:rule "description of the rule"
/factory:rule my-rule "description of the rule"
```

## Step 1: Parse Input

Extract name + description from `$ARGUMENTS`. If empty, ask: "What rule should Claude follow? Describe it in natural language."

## Step 2: Analyze the Description

Determine:

### Scope: Global or Path-Scoped?

| Indicator | Scope | Example |
|---|---|---|
| General coding standard | Global (no paths) | "Always use 2-space indentation" |
| Mentions specific directories | Path-scoped | "In src/api/, validate all inputs" |
| Mentions file types | Path-scoped | "For .tsx files, use functional components" |
| Project-wide convention | Global | "Use conventional commits" |
| Framework-specific | Path-scoped | "In Rails controllers, use strong params" |

### Path Patterns (if scoped)

Convert the description to glob patterns:
- "In the API directory" → `"src/api/**/*"` (inspect actual project structure)
- "For TypeScript files" → `"**/*.ts"` or `"**/*.{ts,tsx}"`
- "In tests" → `"test/**/*"` or `"**/*.test.*"` (inspect actual project structure)

When possible, check the actual project structure to determine the right paths:
```bash
ls -d */ 2>/dev/null  # top-level dirs
```

### Rule Content

The rule should be:
- Specific and verifiable (not vague)
- Actionable (Claude can follow it)
- Concise (one topic per rule)

## Step 3: Detect Target Path

Rules always go to `.claude/rules/` — they are project-level, not plugin-level.

```bash
# Ensure rules directory exists
ls -la .claude/rules/ 2>/dev/null
```

Target: `.claude/rules/<rule-name>.md`

For user-level rules: `~/.claude/rules/<rule-name>.md` (only if user explicitly wants a global rule)

## Step 4: Check for Collisions

```bash
ls -la .claude/rules/<rule-name>.md 2>/dev/null
```

If exists: show error, suggest alternative name. Do not overwrite.

## Step 5: Generate the Rule

Create `.claude/rules/<rule-name>.md`:

**If path-scoped:**
```markdown
---
paths:
  - "<pattern-1>"
  - "<pattern-2>"
---

# <Rule Title>

<Rule content — specific, verifiable instructions>
```

**If global (no paths):**
```markdown
# <Rule Title>

<Rule content — specific, verifiable instructions>
```

**Rule content guidelines:**
- Use bullet points for multiple related instructions
- Be specific: "Use 2-space indentation" not "Format code properly"
- Include examples when helpful
- One topic per rule file
- Keep it concise — rules are loaded into context every session

## Step 6: Post-Generation Summary

```
Rule created: <rule-name>
Location: .claude/rules/<rule-name>.md
Scope: <global | path-scoped to: pattern1, pattern2>
Loaded: <every session | when Claude reads matching files>

Tip: Run /factory:audit .claude/rules/<rule-name>.md to validate.
```
