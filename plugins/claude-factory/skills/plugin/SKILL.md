---
name: plugin
description: Scaffold a complete Claude Code plugin with all components (skills, hooks, agents, MCP) from a natural language description. Use when creating new plugins for a marketplace or standalone. Triggers on /factory:plugin.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Factory: Create Plugin

Official specification: @../../references/plugin-spec.md
Skill spec (for sub-components): @../../references/skill-spec.md
Hook spec (for sub-components): @../../references/hook-spec.md
Agent spec (for sub-components): @../../references/agent-spec.md
plugin.json template: @../../templates/plugin.json
README template: @../../templates/readme.md

## Usage

```
/factory:plugin "description of what the plugin should do"
/factory:plugin my-plugin "description"
```

## Step 1: Parse Input

Extract from `$ARGUMENTS`:
1. **Name**: Kebab-case plugin identifier (inferred or explicit)
2. **Description**: Natural language description of the plugin's purpose

If empty, ask: "What should this plugin do? Describe its purpose and features."

## Step 2: Analyze the Description

Break down the description to identify needed components:

### Component Detection

| Signal in Description | Component | Example |
|---|---|---|
| "command", "skill", "/something" | Skill(s) | "a plugin with a /deploy command" |
| "block", "prevent", "validate before" | Hook (PreToolUse) | "block access to .env files" |
| "notify", "sound", "alert when" | Hook (Stop/Notification) | "play sound when done" |
| "agent", "reviewer", "analyzer" | Agent(s) | "with a code review agent" |
| "MCP", "server", "external API" | MCP config | "integrate with Figma API" |
| "template", "generate", "scaffold" | Templates dir | "generate boilerplate" |

Produce a component manifest:
```
Plugin: <name>
Components:
  - Skills: [list of skills to create]
  - Hooks: [list of hooks to create]
  - Agents: [list of agents to create]
  - MCP: [yes/no, which servers]
  - Templates: [yes/no, which templates]
```

## Step 3: Detect Target Path

1. If CWD has `.claude-plugin/marketplace.json` → write to `plugins/<plugin-name>/` in the marketplace
2. Otherwise → create at `<CWD>/<plugin-name>/` (standalone plugin)

## Step 4: Check for Collisions

```bash
ls -la <target-path>/<plugin-name>/ 2>/dev/null
```

If exists: show error, suggest alternative name. Do not overwrite.

Also check marketplace.json if in marketplace context:
```bash
grep -c '"<plugin-name>"' .claude-plugin/marketplace.json 2>/dev/null
```

## Step 5: Generate the Plugin Structure

### 5.1: Core files (always)

1. **`.claude-plugin/plugin.json`**: Use template, fill in name, description, version 1.0.0, author
   - Author defaults: check git config for name/email, or use "Your Name" placeholder
   ```bash
   git config user.name 2>/dev/null
   git config user.email 2>/dev/null
   ```

2. **`README.md`**: Use template, fill in:
   - Plugin title and description
   - Installation instructions
   - Feature list based on components
   - Usage examples for each skill/command
   - Configuration section if hooks/MCP exist

### 5.2: Skills (if identified)

For each skill in the manifest:
- Create `skills/<skill-name>/SKILL.md`
- Write a complete SKILL.md with frontmatter and actionable instructions
- Follow the same quality bar as `/factory:skill`

### 5.3: Hooks (if identified)

- Create `hooks/hooks.json` with all hook entries
- Create `scripts/` with implementation scripts for each command-type hook
- Follow the same patterns as `/factory:hook`

### 5.4: Agents (if identified)

For each agent:
- Create `agents/<agent-name>.md`
- Write complete frontmatter and system prompt
- Follow the same quality bar as `/factory:agent`

### 5.5: MCP config (if identified)

- Create `.mcp.json` with server definitions
- Note: MCP config typically references external packages, so generate a reasonable structure and mark TODOs for the user

### 5.6: Templates (if identified)

- Create `.templates/` with relevant template files

## Step 6: Marketplace Registration

If in a marketplace context (`.claude-plugin/marketplace.json` exists):

Ask: "Register this plugin in the marketplace? (recommended)"

If yes, read the existing marketplace.json and add the new plugin entry:
```json
{
  "name": "<plugin-name>",
  "source": "./plugins/<plugin-name>",
  "description": "<description>",
  "category": "<detected-category>"
}
```

Category detection:
- Security-related → `"security"`
- Dev tools, scaffolding, testing → `"development"`
- Notifications, productivity → `"productivity"`
- External service integration → `"integration"`

## Step 7: Post-Generation Summary

```
Plugin created: <plugin-name>
Location: <full-path>/<plugin-name>/

Structure:
  .claude-plugin/plugin.json
  README.md
  [skills/<name>/SKILL.md for each skill]
  [hooks/hooks.json + scripts/ for hooks]
  [agents/<name>.md for each agent]
  [.mcp.json for MCP servers]

Marketplace: <registered | not in marketplace context>

Next steps:
  - Review generated files and customize as needed
  - Run /factory:audit <plugin-path> to validate all components
  - Test each skill/command manually
```
