---
name: agent
description: Scaffold a Claude Code agent (subagent) from a natural language description. Use when creating agent .md files, specialized subagents, or AI personas. Triggers on /factory:agent.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# Factory: Create Agent

Official specification: @../../references/agent-spec.md
Template: @../../templates/agent.md

## Usage

```
/factory:agent "description of the agent's role"
/factory:agent my-agent "description of the agent's role"
```

`$ARGUMENTS` contains the user's input. Parse to extract optional name + description.

## Step 1: Parse Input

Extract from `$ARGUMENTS`:
1. **Name**: First word if kebab-case identifier, otherwise infer from description (2-3 words, role-focused)
2. **Description**: Natural language description of the agent's role and responsibilities

If `$ARGUMENTS` is empty, ask: "What role should this agent fill? Describe its responsibilities."

## Step 1.5: Detect Mode (Create or Update)

Check if an agent file already exists at the target location:

```bash
# Look for existing agent with the same name
ls -la <target-path>/agents/<agent-name>.md 2>/dev/null
```

- **If exists** → switch to **Update mode** (jump to "Update Workflow" section at the end)
- **If not** → continue with **Create mode** (proceed to Step 2)

## Step 2: Analyze the Description

From the description, determine:

### Core Properties

| Property | How to Determine |
|---|---|
| **Role** | What persona is this agent? (reviewer, researcher, architect, tester, etc.) |
| **Tools** | What tools does this agent need? Read-only agents get `Read, Glob, Grep`. Writing agents add `Write, Edit, Bash`. |
| **Disallowed tools** | Should any tools be explicitly denied? (e.g., a reviewer should not write code) |
| **Model** | `opus` for deep reasoning/architecture, `sonnet` for balanced tasks, `haiku` for fast read-only work |
| **Effort** | `high`/`max` for complex analysis, `medium` for standard, `low` for simple lookups |
| **Max turns** | Limit for safety: 10-20 for focused tasks, 50+ for exploratory work |
| **Isolation** | `worktree` if the agent modifies files and might conflict with main work |
| **Skills** | Should any skills be preloaded? (list skill names) |
| **Background** | Should this always run in background? (true for monitoring/logging agents) |

### System Prompt Design

The system prompt should:
- Start with a clear identity statement ("You are a senior code reviewer...")
- Define explicit scope and boundaries
- Include behavioral guidelines (tone, depth, format)
- Specify output format when relevant
- Add constraints (what NOT to do)
- Be written in the language matching the user's description

## Step 2.5: Interactive Clarification

Review what was determined in Step 2. If the description is precise enough to resolve all decisions, **skip this step entirely**.

Otherwise, use `AskUserQuestion` to ask **only** about decisions that remain ambiguous:

- **"Which model for this agent?"** (opus/sonnet/haiku) — especially important for agents, as model choice significantly impacts behavior and cost
- **"Should this agent have restricted tools?"** — if the role implies the agent should not have full access (e.g., a reviewer should not write code)
- **"Maximum turns?"** — if the scope suggests the agent should be bounded (focused tasks vs exploratory)
- **"Should this run in a worktree?"** — if the agent modifies files and might conflict with main work

Rules:
- Ask at most 2-3 questions in a single prompt. Do not bombard the user.
- If the description already implies clear answers, do not ask. Assume defaults.
- Merge answers back into the analysis from Step 2 before proceeding.

## Step 3: Detect Target Path

1. CWD inside `plugins/<plugin-name>/` → `<plugin-root>/agents/<agent-name>.md`
2. CWD has marketplace.json → ask which plugin
3. Otherwise → `.claude/agents/<agent-name>.md`

## Step 4: Check for Collisions

```bash
ls -la <target-path>/<agent-name>.md 2>/dev/null
```

If exists: show error, suggest alternative name. Do not overwrite.

## Step 5: Generate the Agent

Create the agent file with:

**Frontmatter**: Include only fields that add value.
- `name`: Always (kebab-case)
- `description`: Always (when Claude should delegate to this agent — this is how auto-matching works)
- `tools`: Include if restricting from default (all)
- `disallowedTools`: Include if explicitly denying tools
- `model`: Include if non-default
- `effort`: Include if non-default
- `maxTurns`: Include for safety bounds
- `isolation`: Include if `worktree` needed
- `skills`: Include if preloading skills
- `background`: Include if true
- `permissionMode`: **Never include for plugin agents** (security restriction)
- `hooks`: **Never include for plugin agents** (security restriction)
- `mcpServers`: **Never include for plugin agents** (security restriction)

**System prompt body**: Write a complete, high-quality system prompt. NOT placeholder text. The prompt should be:
- Detailed enough to guide the agent's behavior
- Specific to the role described
- Including examples when helpful
- Structured with markdown headers

## Update Workflow (Update Mode)

When Step 1.5 detected an existing agent .md:

### U1: Read Existing Agent

```bash
cat <target-path>/agents/<agent-name>.md
```

Parse the existing frontmatter and system prompt body.

### U2: Show Current State

Display the existing agent configuration:

```
Current agent: <agent-name>
  Frontmatter:
    model: <current>
    tools: <current>
    maxTurns: <current>
    ...
  System prompt: <first 3-5 lines preview>
```

### U3: Confirm Changes

Use `AskUserQuestion` to ask:
- "What do you want to change?" (frontmatter, system prompt, or both)
- If frontmatter: show current values vs proposed and ask which to apply
- If system prompt: show current prompt and ask what should change (tone, scope, constraints, etc.)

### U4: Apply Approved Changes

- Use `Edit` (not Write) to apply only the approved modifications
- For frontmatter changes: update only the changed fields
- For system prompt changes: rewrite only the affected sections
- Preserve any content the user did not ask to change

### U5: Post-Update Summary

Display:
```
Agent updated: <agent-name>
Location: <full-path>/agents/<agent-name>.md
Changes applied: <list of changed fields/sections>
```

## Step 6: Post-Generation Summary

```
Agent created: <agent-name>
Location: <full-path>/agents/<agent-name>.md
Model: <model>
Tools: <tools or "all">

Invocation methods:
  - Automatic: Claude delegates based on description matching
  - Natural language: "Use the <agent-name> agent to..."
  - @-mention: @"<agent-name> (agent)"

Tip: Run /factory:audit <path> to validate.
```
