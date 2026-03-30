---
name: hook
description: Scaffold Claude Code hooks (PreToolUse, Stop, Notification, etc.) from a natural language description. Use when creating hooks.json, hook scripts, or event-driven automation. Triggers on /factory:hook.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
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
