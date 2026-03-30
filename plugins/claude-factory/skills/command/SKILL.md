---
name: command
description: Scaffold a Claude Code slash command from a natural language description. Use when creating simple .md commands. Suggests converting to a skill when appropriate. Triggers on /factory:command.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# Factory: Create Command

Official specification: @../../references/command-spec.md
Skill specification (for comparison): @../../references/skill-spec.md
Template: @../../templates/command.md

## Usage

```
/factory:command "description of what the command should do"
/factory:command my-command "description"
```

## Step 1: Parse Input

Extract name + description from `$ARGUMENTS`. If empty, ask.

## Step 2: Detect Mode (Create or Update)

Check if the target command already exists:
```bash
ls -la <target-path>/commands/<command-name>.md 2>/dev/null
```

- **If exists** → **Update mode** (go to Step 10: Update Workflow)
- **If not** → **Create mode** (continue to Step 3)

## Step 3: Evaluate — Command or Skill?

Commands are single-file, simpler. Skills support multi-file structure. **Suggest a skill instead if:**

- The command needs supporting files (scripts, templates, examples)
- The command has sub-commands or multiple workflows
- The command needs auto-activation via file patterns
- The command needs lifecycle hooks

If a skill would be better, say:
"This use case would benefit from a **skill** (multi-file support, templates, auto-activation). Would you like me to create a skill instead with `/factory:skill`?"

If the user wants a command anyway, proceed.

Always use AskUserQuestion to ask:
"This might be better as a skill (supports multi-file, auto-activation). Create as skill instead?"

Wait for the user's answer before proceeding.

## Step 4: Analyze the Description

Determine:
- **Purpose**: What does the command do?
- **Arguments**: What does `$ARGUMENTS` contain?
- **Tools needed**: Which tools are required?
- **Model**: Specific model needed?

## Step 5: Interactive Clarification

Use AskUserQuestion to resolve ambiguities — **only if** the description leaves key decisions unclear. Skip this step if the description is precise enough.

Ask only what is unresolved:
- "What arguments does this command accept?" — if arguments are not clear from the description
- Any other critical decision that cannot be inferred

Do not ask questions whose answers are obvious from the description.

## Step 6: Detect Target Path

1. CWD inside `plugins/<plugin-name>/` → `<plugin-root>/commands/<command-name>.md`
2. CWD has marketplace.json → ask which plugin
3. Otherwise → `.claude/commands/<command-name>.md`

## Step 7: Check for Collisions

Check if `<target-path>/<command-name>.md` exists. If yes, error + suggest alternative.

Also check if a skill with the same name exists (skills take precedence over commands):
```bash
ls -la <target-path>/skills/<command-name>/SKILL.md 2>/dev/null
```

If a skill exists with the same name, warn: "A skill named `<name>` already exists and takes precedence over commands."

## Step 8: Generate the Command

Create `<target-path>/commands/<command-name>.md` with:

**Frontmatter**: Minimal.
- `description`: Always include (when to trigger this command)

**Body**: Clear instructions for Claude to follow when the command is invoked.
- Purpose statement
- How to use `$ARGUMENTS`
- Step-by-step execution instructions
- Output format

## Step 9: Post-Generation Summary

```
Command created: <command-name>
Location: <full-path>/commands/<command-name>.md
Invocation: /<namespace>:<command-name> (plugin) or /<command-name> (standalone)

Note: Commands and skills have been merged. Skills are recommended for new work.

Tip: Run /factory:audit <path> to validate.
```

## Step 10: Update Workflow (Update Mode)

Triggered when Step 2 detects the command already exists.

### 10.1: Read Existing Command

Read the existing command file and parse its frontmatter and body.

### 10.2: Show Current State

Display to the user:
```
Existing command: <command-name>
Location: <full-path>
Description: <current description from frontmatter>
Tools: <current allowed-tools>
---
<summary of current body/instructions>
```

### 10.3: Ask What to Change

Use AskUserQuestion: "What would you like to change in this command? (e.g., description, arguments, behavior, tools)"

### 10.4: Apply Modifications

Edit the existing file with the requested changes. Use the Edit tool to make targeted modifications, not a full rewrite.

### 10.5: Post-Update Summary

```
Command updated: <command-name>
Location: <full-path>
Changes: <summary of what was modified>

Tip: Run /factory:audit <path> to validate.
```
