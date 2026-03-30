# Claude Factory

> Meta-plugin for creating Claude Code tools — skills, hooks, agents, commands, rules, CLAUDE.md maintenance, audit, and offline documentation reference.

## Features

9 skills covering the full Claude Code extensibility surface:

| Skill | Command | Description |
|-------|---------|-------------|
| **Skill scaffold** | `/factory:skill` | Generate SKILL.md with frontmatter and actionable instructions |
| **Hook scaffold** | `/factory:hook` | Generate hooks.json + implementation scripts |
| **Agent scaffold** | `/factory:agent` | Generate agent .md with system prompt |
| **Command scaffold** | `/factory:command` | Generate command .md (suggests skill if more appropriate) |
| **Rule scaffold** | `/factory:rule` | Generate .claude/rules/ with path-scoping |
| **Plugin scaffold** | `/factory:plugin` | Generate complete plugin with all components |
| **CLAUDE.md** | `/factory:claude-md` | Analyze, optimize, or generate CLAUDE.md |
| **Audit** | `/factory:audit` | Validate any artifact against official specs |
| **Docs** | `/factory:docs` | Quick reference for Claude Code specifications |

## Usage

### Create a skill

```
/factory:skill "a skill that deploys to staging with confirmation"
/factory:skill my-deploy "deploy to staging environment"
```

### Create a hook

```
/factory:hook "block rm -rf commands in Bash"
/factory:hook "play a sound when Claude finishes"
```

### Create an agent

```
/factory:agent "a senior code reviewer focused on security"
```

### Create a rule

```
/factory:rule "in src/api/, always validate input parameters"
/factory:rule "use conventional commits for all commit messages"
```

### Scaffold a complete plugin

```
/factory:plugin "a notification plugin that plays sounds and shows OS alerts"
```

### Maintain CLAUDE.md

```
/factory:claude-md                     # Analyze current CLAUDE.md
/factory:claude-md --generate          # Generate from scratch
```

### Audit existing artifacts

```
/factory:audit plugins/my-plugin/      # Audit entire plugin
/factory:audit .claude/skills/deploy/  # Audit a single skill
```

### Look up documentation

```
/factory:docs "hook events that can block"
/factory:docs "skill frontmatter fields"
/factory:docs "permission rules syntax"
```

## How It Works

- **Prompt libre**: describe what you want in natural language, the factory generates it
- **Context-aware**: detects if you're inside a marketplace plugin or a standalone project
- **Collision-safe**: never overwrites existing artifacts
- **Offline**: all documentation is statically embedded (March 2026 specs)
- **No scripts**: pure LLM instructions + templates, no build step

## Embedded Documentation

8 reference files covering 100% of the official Claude Code specification:

- `skill-spec.md` — 14+ frontmatter fields, string substitutions, dynamic context
- `hook-spec.md` — 25+ events, 4 hook types, exit codes, JSON output schema
- `agent-spec.md` — 16+ frontmatter fields, constraints, invocation methods
- `command-spec.md` — Format, merge with skills, built-in commands
- `rule-spec.md` — Path-scoping, glob patterns, loading behavior
- `settings-spec.md` — Permission rules, hooks config, managed settings
- `claude-md-spec.md` — Locations, imports, writing guidelines
- `plugin-spec.md` — plugin.json schema, marketplace registration

## Positioning

`claude-factory` is a **standalone plugin** with no dependencies. It can coexist with `compound-engineering:create-agent-skills` — use whichever fits your workflow.
