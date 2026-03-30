---
name: command
description: Scaffold a Claude Code slash command from a natural language description. Use when creating simple .md commands. Suggests converting to a skill when appropriate. Triggers on /factory:command.
allowed-tools: Read, Write, Glob, Grep, Bash
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

## Step 2: Evaluate — Command or Skill?

Commands are single-file, simpler. Skills support multi-file structure. **Suggest a skill instead if:**

- The command needs supporting files (scripts, templates, examples)
- The command has sub-commands or multiple workflows
- The command needs auto-activation via file patterns
- The command needs lifecycle hooks

If a skill would be better, say:
"This use case would benefit from a **skill** (multi-file support, templates, auto-activation). Would you like me to create a skill instead with `/factory:skill`?"

If the user wants a command anyway, proceed.

## Step 3: Analyze the Description

Determine:
- **Purpose**: What does the command do?
- **Arguments**: What does `$ARGUMENTS` contain?
- **Tools needed**: Which tools are required?
- **Model**: Specific model needed?

## Step 4: Detect Target Path

1. CWD inside `plugins/<plugin-name>/` → `<plugin-root>/commands/<command-name>.md`
2. CWD has marketplace.json → ask which plugin
3. Otherwise → `.claude/commands/<command-name>.md`

## Step 5: Check for Collisions

Check if `<target-path>/<command-name>.md` exists. If yes, error + suggest alternative.

Also check if a skill with the same name exists (skills take precedence over commands):
```bash
ls -la <target-path>/skills/<command-name>/SKILL.md 2>/dev/null
```

If a skill exists with the same name, warn: "A skill named `<name>` already exists and takes precedence over commands."

## Step 6: Generate the Command

Create `<target-path>/commands/<command-name>.md` with:

**Frontmatter**: Minimal.
- `description`: Always include (when to trigger this command)

**Body**: Clear instructions for Claude to follow when the command is invoked.
- Purpose statement
- How to use `$ARGUMENTS`
- Step-by-step execution instructions
- Output format

## Step 7: Post-Generation Summary

```
Command created: <command-name>
Location: <full-path>/commands/<command-name>.md
Invocation: /<namespace>:<command-name> (plugin) or /<command-name> (standalone)

Note: Commands and skills have been merged. Skills are recommended for new work.

Tip: Run /factory:audit <path> to validate.
```
