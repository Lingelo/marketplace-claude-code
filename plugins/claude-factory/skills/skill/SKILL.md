---
name: skill
description: Scaffold a Claude Code skill from a natural language description. Use when creating SKILL.md files, /commands, or extending Claude Code with new skills. Triggers on /factory:skill.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
---

# Factory: Create Skill

Official specification: @../../references/skill-spec.md
Simple template: @../../templates/skill-simple.md
Router template: @../../templates/skill-router.md

## Usage

```
/factory:skill "description of what the skill should do"
/factory:skill my-skill-name "description of what the skill should do"
```

`$ARGUMENTS` contains the user's input. Parse it to extract:
- Optional explicit name (first word if it looks like a kebab-case identifier, not a sentence)
- Description (the rest, or everything if no explicit name)

## Step 1: Parse Input

Extract from `$ARGUMENTS`:
1. **Name**: If first argument is a single kebab-case word (no spaces, no quotes), use it as the skill name. Otherwise, infer a kebab-case name from the description (2-4 words, descriptive).
2. **Description**: The natural language description of what the skill should do.

If `$ARGUMENTS` is empty, ask the user: "What should this skill do? Describe it in natural language."

## Step 1.5: Detect Mode (Create or Update)

Check if a SKILL.md already exists at the target location:

```bash
# Look for existing skill with the same name
ls -la <target-path>/skills/<skill-name>/SKILL.md 2>/dev/null
```

- **If exists** → switch to **Update mode** (jump to "Update Workflow" section at the end)
- **If not** → continue with **Create mode** (proceed to Step 2)

## Step 2: Analyze the Description

From the description, determine:

- **Purpose**: What does the skill accomplish?
- **Complexity**: Simple (single-purpose) or router (multiple sub-commands)?
- **Tools needed**: Which Claude Code tools does this skill require? (Read, Write, Edit, Glob, Grep, Bash, Agent, WebSearch, WebFetch, AskUserQuestion, etc.)
- **Model**: Does this need a specific model? (opus for complex reasoning, haiku for speed, sonnet for balance)
- **Effort level**: low/medium/high/max based on complexity
- **Auto-activation paths**: Should this skill activate automatically for certain file patterns?
- **Context isolation**: Does this need `context: fork` for subagent isolation?
- **Hooks**: Does this skill need inline hooks? (e.g., PreToolUse validation)

## Step 2.5: Interactive Clarification

Review what was determined in Step 2. If the description is precise enough to resolve all decisions, **skip this step entirely**.

Otherwise, use `AskUserQuestion` to ask **only** about decisions that remain ambiguous:

- **"Which model should this skill use?"** (sonnet/opus/haiku/inherit) — only if not inferable from the description
- **"Should this skill run in isolated context (fork)?"** — only if the skill seems complex enough to warrant it
- **"Which tools does this skill need?"** — only if not obvious from the description
- **"Should this skill auto-activate for certain file patterns?"** — only if path-based activation seems relevant

Rules:
- Ask at most 2-3 questions in a single prompt. Do not bombard the user.
- If the description already implies clear answers, do not ask. Assume defaults.
- Merge answers back into the analysis from Step 2 before proceeding.

## Step 3: Detect Target Path

Determine where to write the skill:

```bash
# Check if we're inside a plugin directory
pwd_output=$(pwd)
```

**Resolution logic:**
1. If CWD matches `*/plugins/<plugin-name>/*` → write to `<CWD>/skills/<skill-name>/SKILL.md` (or relative to the plugin root)
2. If CWD contains `.claude-plugin/marketplace.json` → list available plugins under `plugins/` and ask which one to target
3. Otherwise → write to `.claude/skills/<skill-name>/SKILL.md` (standalone project)

## Step 4: Check for Collisions

```bash
# Check if target directory already exists
ls -la <target-path>/skills/<skill-name>/ 2>/dev/null
```

If the directory exists:
- Show: "A skill named `<skill-name>` already exists at `<path>`"
- Suggest: "Use a different name or check the existing skill"
- **Stop. Do not overwrite.**

## Step 5: Determine Template

- If the skill has sub-commands or multiple workflows → use **router template** (`@../../templates/skill-router.md`)
- Otherwise → use **simple template** (`@../../templates/skill-simple.md`)

## Step 6: Generate the Skill

Create the directory and SKILL.md:

1. Create `<target-path>/skills/<skill-name>/` directory
2. Write `SKILL.md` with:
   - **Frontmatter**: All relevant fields from the analysis (Step 2). Only include fields that add value — don't add empty or default fields.
   - **Body**: Actionable instructions that Claude can follow. NOT placeholder text. The instructions should be specific to what the skill does, with clear steps, examples, and expected outputs.

**Frontmatter rules:**
- `name`: Always include (the kebab-case name)
- `description`: Always include. Front-load the use case. Include trigger keywords. Max 250 chars.
- `allowed-tools`: Include only if restricting tools (don't include if all tools are needed)
- `model`: Include only if a specific model is needed
- `effort`: Include only if non-default
- `context`: Include only if `fork` is needed
- `paths`: Include only if auto-activation is relevant
- `shell`: Include only if `powershell` is needed (bash is default)
- `hooks`: Include only if inline hooks are needed

**Body rules:**
- Start with a clear purpose statement
- Include usage examples with the actual skill name
- Write step-by-step instructions that Claude can execute
- Include output format/expectations
- Reference supporting files if the skill generates them

3. If the skill needs supporting files (scripts, templates, examples), create them in the skill directory.

## Update Workflow (Update Mode)

When Step 1.5 detected an existing SKILL.md:

### U1: Read Existing Skill

```bash
cat <target-path>/skills/<skill-name>/SKILL.md
```

Parse the existing frontmatter and body content.

### U2: Compare Current vs Proposed

Build a diff of what the user wants to change. Show the user:

```
Current frontmatter:
  name: <current>
  description: <current>
  allowed-tools: <current>
  ...

Proposed changes:
  <field>: <current> → <new>
  ...
```

### U3: Confirm Changes

Use `AskUserQuestion` to present the comparison and ask:
- "Here are the proposed frontmatter changes. Which should I apply?" (show the diff)
- "Should the body content (instructions) also be updated?" — only if the user's description implies structural changes

### U4: Apply Approved Changes

- Use `Edit` (not Write) to apply only the approved modifications
- Preserve any content the user did not ask to change
- If body updates are approved, rewrite only the affected sections

### U5: Post-Update Summary

Display:
```
Skill updated: <skill-name>
Location: <full-path>/skills/<skill-name>/SKILL.md
Changes applied: <list of changed fields/sections>
```

## Step 7: Post-Generation Summary

Display:
```
Skill created: <skill-name>
Location: <full-path>/skills/<skill-name>/SKILL.md
Invocation: /<namespace>:<skill-name> (plugin) or /<skill-name> (standalone)

Tip: Run /factory:audit <path> to validate the generated skill.
```
