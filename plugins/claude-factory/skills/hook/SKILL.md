---
name: hook
description: Scaffold Claude Code hooks (PreToolUse, Stop, Notification, etc.) from a natural language description. Use when creating hooks.json, hook scripts, or event-driven automation. Triggers on /factory:hook.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# Factory: Create Hook

Official specification: @../../references/hook-spec.md
JSON template: @../../templates/hook-command.json
Node.js script template: @../../templates/hook-script.js
Bash script template: @../../templates/hook-script.sh

## Usage

```
/factory:hook "description of the hook behavior"
/factory:hook "block rm -rf commands"
/factory:hook "notify on Slack when tests fail"
/factory:hook "play a sound when Claude finishes a turn"
```

`$ARGUMENTS` contains the user's description of the desired hook behavior.

## Step 1: Parse Input

If `$ARGUMENTS` is empty, ask: "What should this hook do? Describe the behavior in natural language."

## Step 1.5: Detect Mode (Create or Update)

Check if hooks already exist at the target location:

```bash
# Look for existing hooks.json in plugin context
cat <target-plugin>/hooks/hooks.json 2>/dev/null
```

- **If exists** → switch to **Update mode** (jump to "Update Workflow" section at the end)
- **If not** → continue with **Create mode** (proceed to Step 2)

## Step 2: Analyze the Description

From the description, determine:

### Event Type

Match the description to the most appropriate hook event:

| User Intent | Event | Matcher |
|---|---|---|
| Block/allow a tool action | `PreToolUse` | Tool name regex (e.g., `Bash`, `Read\|Write`, `Edit`) |
| React after a tool runs | `PostToolUse` | Tool name regex |
| React to tool failure | `PostToolUseFailure` | Tool name regex |
| Do something when Claude finishes | `Stop` | — |
| Play sound/notify on permission prompt | `Notification` | `permission_prompt`, `idle_prompt` |
| Run something at session start | `SessionStart` | `startup`, `resume` |
| Validate user input | `UserPromptSubmit` | — |
| React to config changes | `ConfigChange` | Setting type |
| React to file changes | `FileChanged` | Filename basename |

If the intent is ambiguous, ask the user to clarify.

### Hook Type

| Type | When to Use |
|---|---|
| `command` | Most common. Shell script with exit code logic. Use for file checks, sound playback, notifications, blocking. |
| `http` | POST to a URL. Use for webhooks, Slack notifications, external APIs. |
| `prompt` | LLM evaluation. Use for nuanced decisions that need reasoning. |
| `agent` | Subagent verification. Use for complex multi-step validation. |

### Matcher Pattern

- For `PreToolUse`/`PostToolUse`: regex matching tool names (e.g., `Bash`, `Read\|Write\|Edit`, `Bash\(rm\|mv\)`)
- For `Notification`: event type string
- For `SessionStart`: trigger type
- For other events: usually not needed

### Script Language (for `command` type)

- **Node.js** if: complex JSON parsing, multiple conditions, file system operations
- **Bash** if: simple checks, calling system commands (afplay, osascript, notify-send)

## Step 2.5: Interactive Clarification

Review what was determined in Step 2. If the description is precise enough to resolve all decisions, **skip this step entirely**.

Otherwise, use `AskUserQuestion` to ask **only** about decisions that remain ambiguous:

- **"Which event should trigger this hook?"** — if the description could match multiple events (e.g., PreToolUse vs PostToolUse)
- **"What type of hook?"** (command/http/prompt/agent) — if not obvious from the description
- **"Which tool(s) should the matcher target?"** — if PreToolUse event and the tool scope is unclear
- **"Should the script be Node.js or Bash?"** — for command type when the complexity is borderline

Rules:
- Ask at most 2-3 questions in a single prompt. Do not bombard the user.
- If the description already implies clear answers, do not ask. Assume defaults.
- Merge answers back into the analysis from Step 2 before proceeding.

## Step 3: Detect Target Path

**Resolution logic:**
1. If CWD matches `*/plugins/<plugin-name>/*` → write to plugin's `hooks/` directory
2. If CWD contains `.claude-plugin/marketplace.json` → ask which plugin to target
3. Otherwise → the hook goes into project settings (`.claude/settings.json` or `.claude/settings.local.json`)

For **plugin context**: generate `hooks/hooks.json` + `scripts/<script-name>.js|sh`
For **standalone context**: generate the hook config to be added to settings.json

## Step 4: Check for Existing Hooks

```bash
# Check for existing hooks.json in plugin context
cat <target-plugin>/hooks/hooks.json 2>/dev/null
```

**If `hooks.json` already exists:**
- Read the existing file
- **Append** the new hook entry to the appropriate event array
- Do NOT overwrite existing hooks
- If the same event+matcher combination already exists, warn the user

**If no `hooks.json` exists:**
- Create a new one from the template

## Step 5: Generate the Hook

### For `command` type hooks:

1. **Generate/update `hooks.json`:**
   - Use the `hook-command.json` template as base
   - Fill in: description, event, matcher, script path, timeout
   - Default timeout: 5000ms for quick checks, 10000ms for network calls, 30000ms for complex operations

2. **Generate the script:**
   - Create `scripts/<descriptive-name>.js` or `scripts/<descriptive-name>.sh`
   - Use the appropriate template (`hook-script.js` or `hook-script.sh`)
   - Write the ACTUAL logic, not placeholder code
   - Include proper error handling
   - For blocking hooks: write clear stderr messages explaining WHY the action was blocked
   - For notification hooks: handle cross-platform (macOS/Linux/Windows)

### For `http` type hooks:

Generate hooks.json with:
```json
{
  "type": "http",
  "url": "{{URL}}",
  "headers": { "Content-Type": "application/json" },
  "timeout": 10000
}
```

### For `prompt` type hooks:

Generate hooks.json with:
```json
{
  "type": "prompt",
  "prompt": "{{EVALUATION_PROMPT}}"
}
```

### For `agent` type hooks:

Generate hooks.json with:
```json
{
  "type": "agent",
  "agent": "{{AGENT_NAME}}",
  "prompt": "{{VERIFICATION_PROMPT}}"
}
```

## Step 6: Cross-Platform Considerations

For scripts that use system commands:

| Feature | macOS | Linux | Windows |
|---|---|---|---|
| Sound | `afplay` | `paplay` / `aplay` | PowerShell `[System.Media.SoundPlayer]` |
| Notification | `osascript -e 'display notification'` | `notify-send` | PowerShell toast |
| Clipboard | `pbcopy` | `xclip` | `clip.exe` |

Include platform detection in scripts:
```bash
case "$(uname -s)" in
  Darwin*) # macOS ;;
  Linux*)  # Linux ;;
  MINGW*|MSYS*|CYGWIN*) # Windows ;;
esac
```

## Update Workflow (Update Mode)

When Step 1.5 detected an existing hooks.json:

### U1: Read Existing Hooks

```bash
cat <target-plugin>/hooks/hooks.json
```

Parse all existing hook entries grouped by event type.

### U2: Show Current Hooks

Display the existing hooks to the user:

```
Current hooks in <plugin-name>:
  1. [PreToolUse] matcher: "Bash" → scripts/block-dangerous.sh
  2. [Stop] → scripts/notify-done.js
  ...
```

Use `AskUserQuestion` to ask:
- "Here are the existing hooks. Which one do you want to modify? Or should I add a new hook?"

### U3: Propose Changes

Based on the user's answer:

**For modifications:**
- Show current hook config and script logic
- Propose specific changes via `AskUserQuestion`:
  - "Here is the current script logic. What should change?"
  - Show before/after for the hooks.json entry

**For additions:**
- Proceed with normal creation flow (Steps 2-5) but append to existing hooks.json instead of creating new

### U4: Apply Approved Changes

- Use `Edit` (not Write) to modify hooks.json entries
- For script changes: use `Edit` to update only the affected sections
- Preserve all hooks and scripts the user did not ask to change

### U5: Post-Update Summary

Display:
```
Hook updated: <event-type> [<matcher>]
Location: <path-to-hooks.json>
Script: <path-to-script> (if modified)
Changes: <summary of what changed>
```

## Step 7: Post-Generation Summary

Display:
```
Hook created:
  Event: <event-type>
  Matcher: <matcher-pattern>
  Type: <hook-type>
  Location: <path-to-hooks.json>
  Script: <path-to-script> (if applicable)

Exit codes: 0 = allow | 2 = block

Tip: Run /factory:audit <hooks.json-path> to validate.
```
