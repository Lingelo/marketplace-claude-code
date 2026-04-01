---
name: audit
description: Validate Claude Code artifacts (skills, hooks, agents, commands, rules, plugins) against official specifications. Use when checking conformity, finding errors, or validating generated output. Triggers on /factory:audit.
allowed-tools: Read, Glob, Grep, Bash
---

# Factory: Audit & Validate

Specifications:
@../../references/skill-spec.md
@../../references/hook-spec.md
@../../references/agent-spec.md
@../../references/command-spec.md
@../../references/rule-spec.md
@../../references/plugin-spec.md
@../../references/claude-md-spec.md
@../../references/settings-spec.md

## Usage

```
/factory:audit path/to/artifact        # Audit a single file or directory
/factory:audit path/to/plugin/         # Audit an entire plugin
/factory:audit .                       # Audit current directory
```

`$ARGUMENTS` contains the path to audit.

## Step 1: Parse Input

If `$ARGUMENTS` is empty, ask: "What should I audit? Provide a path to a file, directory, or plugin."

Resolve the path:
```bash
ls -la $ARGUMENTS 2>/dev/null
```

## Step 2: Detect Artifact Type

Determine what kind of artifact is at the path:

| Path Pattern | Type | What to Validate |
|---|---|---|
| `*/SKILL.md` | Skill | Frontmatter fields, body structure |
| `*/hooks.json` or `*/hooks/hooks.json` | Hooks | JSON schema, events, matchers, scripts |
| `*/agents/*.md` (not SKILL.md) | Agent | Frontmatter fields, system prompt |
| `*/commands/*.md` | Command | Frontmatter, body |
| `*/.claude/rules/*.md` or `*/rules/*.md` | Rule | Path-scoping, content |
| `*/CLAUDE.md` | CLAUDE.md | Structure, quality, imports |
| `*/.claude-plugin/plugin.json` exists in tree | Plugin (full) | All components |
| `*/settings.json` or `*/settings.local.json` | Settings | Schema, permissions |
| Directory with `.claude-plugin/` | Plugin (full) | All components recursively |

If ambiguous (e.g., a generic .md file), examine the content to determine type.

For **plugin directories**, audit ALL components recursively.

## Step 3: Run Validation

### Skill Validation

Read the SKILL.md and check:

| Check | Rule | Severity |
|---|---|---|
| Frontmatter exists | YAML frontmatter present | Error |
| `name` field | Present, lowercase, hyphens only, max 64 chars | Error if missing, Warning if format wrong |
| `description` field | Present, max 250 chars, starts with verb or action | Warning if missing |
| `allowed-tools` | If present, valid tool names (Read, Write, Edit, Glob, Grep, Bash, Agent, WebSearch, WebFetch, AskUserQuestion, etc.) | Warning if unknown tools |
| `model` | If present, valid value (sonnet, opus, haiku, or full model ID) | Error if invalid |
| `effort` | If present, one of: low, medium, high, max | Error if invalid |
| `context` | If present, must be `fork` | Error if invalid |
| `paths` | If present, valid glob patterns | Warning |
| Body quality | Non-empty, has instructions | Warning if empty/placeholder |
| Line count | Under 500 lines | Warning if over |
| Imports | `@` references resolve to existing files | Error if missing |

### Hook Validation

Read hooks.json and check:

| Check | Rule | Severity |
|---|---|---|
| Valid JSON | Parses without error | Error |
| `hooks` key | Top-level object has `hooks` | Error |
| Event names | Valid event names (PreToolUse, PostToolUse, Stop, Notification, SessionStart, UserPromptSubmit, etc.) | Error if unknown |
| Matcher format | Valid regex | Warning |
| Hook type | One of: command, http, prompt, agent | Error if unknown |
| Command path | Script exists at referenced path | Error if missing |
| Timeout | Positive number, reasonable range (100-600000) | Warning |

For scripts referenced by hooks:
| Check | Rule | Severity |
|---|---|---|
| Script exists | File at path | Error |
| Executable | Has execute permission (for shell scripts) | Warning |
| Exit codes | Uses exit 0 (allow) or exit 2 (block), not other codes for control flow | Info |
| Stdin parsing | Reads JSON from stdin | Info |

### Agent Validation

| Check | Rule | Severity |
|---|---|---|
| Frontmatter exists | YAML frontmatter present | Error |
| `name` field | Present, lowercase, hyphens | Error |
| `description` field | Present, describes when to delegate | Error if missing |
| `model` | If present, valid value | Error if invalid |
| `tools` | If present, valid tool names | Warning |
| `maxTurns` | If present, positive number | Warning |
| Plugin restrictions | No `permissionMode`, `hooks`, `mcpServers` in plugin agents | Error |
| System prompt | Non-empty body with role definition | Warning |

### Command Validation

| Check | Rule | Severity |
|---|---|---|
| Frontmatter | Has `description` field | Warning |
| Body | Non-empty instructions | Warning |
| Naming conflict | Check if a skill with same name exists | Warning |

### Rule Validation

| Check | Rule | Severity |
|---|---|---|
| `paths` field | If present, valid glob patterns | Warning |
| Content quality | Specific, verifiable instructions | Info |
| File location | In `.claude/rules/` directory | Info |

### CLAUDE.md Extended Checks

#### @[MODEL] Tags Detection

Scan for HTML comments containing model-specific tags: `<!-- @[OPUS-4.6] -->`, `<!-- @[SONNET-4.6] -->`, `<!-- @[HAIKU-4.5] -->`, etc.

| Check | Rule | Severity |
|---|---|---|
| Model tags found | List all `@[MODEL]` tags with file and line number | Info |
| Outdated model tags | Tags referencing models older than current (e.g., `@[OPUS-4.5]` when using Opus 4.6) | Warning — "This rule may be obsolete, verify if still needed" |
| Untagged model-specific rules | Rules mentioning model quirks (e.g., "em-dash", "tirets cadratins") without a `@[MODEL]` tag | Info — "Consider adding a @[MODEL] tag for maintenance" |
| Tagged vs untagged ratio | Count tagged rules vs total rules | Info — prompt engineering technical debt indicator |

Search pattern: `grep -rn '@\[.*\]' *.md .claude/rules/ CLAUDE.md` across CLAUDE.md, SKILL.md, agents, rules.

#### Vague Instructions Detection

Scan CLAUDE.md and rules for vague, unverifiable instructions and suggest numeric thresholds:

| Vague Pattern | Suggested Replacement | Severity |
|---|---|---|
| "sois concis" / "be concise" / "keep it short" | "Max 3 phrases par explication, code uniquement quand possible" | Warning |
| "fonctions courtes" / "short functions" / "small functions" | "Max 50 lignes par fonction" | Warning |
| "code propre" / "clean code" / "good code" / "quality code" | "0 warning ESLint/linter, 0 TODO non-assigné" | Warning |
| "bien testé" / "well tested" / "good tests" | "Couverture tests ≥ 80%" | Warning |
| "bonne couverture" / "good coverage" | "Couverture tests ≥ 80%, ≥ 1 test par fonction publique" | Warning |
| "performant" / "fast" / "efficient" / "rapide" | "Temps de réponse < 200ms pour les endpoints API" | Warning |
| "lisible" / "readable" | "Max 100 caractères par ligne, noms descriptifs ≥ 3 caractères" | Warning |
| "modulaire" / "modular" | "Max 1 responsabilité par module, max 300 lignes par fichier" | Warning |
| "sécurisé" / "secure" | "Valider tous les inputs utilisateur, échapper les outputs HTML" | Warning |

Report these as: `[W] CLAUDE.md:42 — Vague instruction "sois concis" — consider: "Max 3 phrases par explication"`

### Plugin Validation (recursive)

| Check | Rule | Severity |
|---|---|---|
| `plugin.json` | Exists with name, version, description, author | Error if missing/incomplete |
| README.md | Exists | Warning |
| All skills | Pass skill validation | Per-skill |
| All hooks | Pass hook validation | Per-hook |
| All agents | Pass agent validation | Per-agent |
| Marketplace entry | If marketplace context, plugin is registered | Info |

## Step 4: Generate Report

Present a structured audit report:

```
Audit Report: <path>
Type: <artifact type>
Status: <PASS | WARN | FAIL>

Errors (<count>):
  - [E1] <file>:<line> — <description>
  - [E2] <file>:<line> — <description>

Warnings (<count>):
  - [W1] <file>:<line> — <description>

Info (<count>):
  - [I1] <description>

Summary: <X> errors, <Y> warnings, <Z> info
```

**Status rules:**
- **PASS**: 0 errors, 0 warnings
- **WARN**: 0 errors, 1+ warnings
- **FAIL**: 1+ errors

## Step 5: Suggest Fixes

For each error and warning, propose the specific fix:
- For frontmatter issues: show the corrected frontmatter
- For missing files: suggest creating them
- For schema violations: show the valid format
- For plugin issues: list all components that need attention

Ask: "Apply suggested fixes? (all / specific / none)"
