---
name: rule
description: Scaffold a Claude Code rule (.claude/rules/) from a natural language description. Use when creating project rules, coding standards, or path-scoped instructions. Triggers on /factory:rule.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
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

## Step 2: Detect Mode (Create or Update)

Check if the target rule already exists:
```bash
ls -la .claude/rules/<rule-name>.md 2>/dev/null
```

- **If exists** → **Update mode** (go to Step 9: Update Workflow)
- **If not** → **Create mode** (continue to Step 3)

## Step 3: Analyze the Description

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

## Step 4: Interactive Clarification

Use AskUserQuestion to resolve ambiguities — **only if** the description leaves key decisions unclear. Skip this step if the description is precise enough.

Ask only what is unresolved:
- "Should this rule be path-scoped or global?" — include a recommendation based on the analysis in Step 3 (e.g., "Based on your description mentioning `.tsx` files, I recommend path-scoped. Should this rule be path-scoped or global?")
- "Which file patterns should trigger this rule?" — only if path-scoped was chosen and patterns are not obvious from the description

Do not ask questions whose answers are obvious from the description.

## Step 5: Detect Target Path

Rules always go to `.claude/rules/` — they are project-level, not plugin-level.

```bash
# Ensure rules directory exists
ls -la .claude/rules/ 2>/dev/null
```

Target: `.claude/rules/<rule-name>.md`

For user-level rules: `~/.claude/rules/<rule-name>.md` (only if user explicitly wants a global rule)

## Step 6: Check for Collisions

```bash
ls -la .claude/rules/<rule-name>.md 2>/dev/null
```

If exists: show error, suggest alternative name. Do not overwrite.

## Step 7: Generate the Rule

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

## Step 8: Post-Generation Summary

```
Rule created: <rule-name>
Location: .claude/rules/<rule-name>.md
Scope: <global | path-scoped to: pattern1, pattern2>
Loaded: <every session | when Claude reads matching files>

Tip: Run /factory:audit .claude/rules/<rule-name>.md to validate.
```

## Step 9: Update Workflow (Update Mode)

Triggered when Step 2 detects the rule already exists.

### 9.1: Read Existing Rule

Read the existing rule file and parse its frontmatter (paths) and body content.

### 9.2: Show Current State

Display to the user:
```
Existing rule: <rule-name>
Location: .claude/rules/<rule-name>.md
Scope: <global | path-scoped to: pattern1, pattern2>
---
<current rule content>
```

### 9.3: Ask What to Modify

Use AskUserQuestion: "What would you like to change? (e.g., rule content, scope, path patterns, or add/remove instructions)"

### 9.4: Apply Modifications

Edit the existing file with the requested changes. Use the Edit tool to make targeted modifications, not a full rewrite.

### 9.5: Post-Update Summary

```
Rule updated: <rule-name>
Location: .claude/rules/<rule-name>.md
Scope: <global | path-scoped to: pattern1, pattern2>
Changes: <summary of what was modified>

Tip: Run /factory:audit .claude/rules/<rule-name>.md to validate.
```
