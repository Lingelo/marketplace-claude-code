# Claude Code Hook Specification

> Last updated: March 2026 | Source: code.claude.com/docs/en/hooks

## Overview

Hooks are event-driven scripts that execute at tool boundaries. They can block actions, inject context, or trigger side effects.

## Configuration Locations

| Location | Scope |
|---|---|
| `~/.claude/settings.json` | All projects |
| `.claude/settings.json` | Project (shared) |
| `.claude/settings.local.json` | Project (personal) |
| Plugin `hooks/hooks.json` | When plugin enabled |
| Skill/agent YAML frontmatter | While active |
| Managed policy settings | Organization-wide |

## Complete Event List

| Event | Matcher Input | Can Block? | Description |
|---|---|---|---|
| `SessionStart` | `startup`, `resume`, `clear`, `compact` | No | Context injection only |
| `UserPromptSubmit` | — | Yes (exit 2) | Before user prompt is processed |
| `PreToolUse` | Tool name regex | Yes (exit 2 or JSON) | Before a tool executes |
| `PermissionRequest` | Tool name | Yes (decision: deny) | When tool requests permission |
| `PostToolUse` | Tool name | No (feedback only) | After tool completes |
| `PostToolUseFailure` | Tool name | No (feedback only) | After tool fails |
| `Notification` | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` | No | System notifications |
| `SubagentStart` | Agent type name | No (context injection) | When subagent spawns |
| `SubagentStop` | Agent type name | Yes | When subagent finishes |
| `Stop` | — | Yes (blocks completion) | When Claude finishes a turn |
| `StopFailure` | `rate_limit`, `authentication_failed`, `billing_error`, etc. | No | On stop error |
| `TeammateIdle` | — | Yes | When teammate becomes idle |
| `TaskCreated` | — | Yes | When task is created |
| `TaskCompleted` | — | Yes | When task completes |
| `InstructionsLoaded` | `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact` | No | When instructions load |
| `ConfigChange` | `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills` | Yes | When config changes |
| `CwdChanged` | — | No | Directory change |
| `FileChanged` | Filename (basename) | No | File modification |
| `PreCompact` | `manual`, `auto` | No | Before context compaction |
| `PostCompact` | `manual`, `auto` | No | After context compaction |
| `Elicitation` | MCP server names | Yes | MCP elicitation |
| `ElicitationResult` | MCP server names | Yes | MCP elicitation result |
| `WorktreeCreate` | — | Yes | Worktree creation |
| `WorktreeRemove` | — | No | Worktree removal |
| `SessionEnd` | `clear`, `resume`, `logout`, `prompt_input_exit`, etc. | No | Session ending |

## Hook JSON Schema

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "regex_pattern",
        "hooks": [
          {
            "type": "command",
            "command": "path/to/script.sh",
            "if": "Bash(rm *)",
            "timeout": 600,
            "statusMessage": "Validating...",
            "once": false,
            "async": false,
            "shell": "bash"
          }
        ]
      }
    ]
  }
}
```

## Hook Types

| Type | Description | Receives | Returns |
|---|---|---|---|
| `command` | Shell script | JSON on stdin | Exit code + stdout |
| `http` | POST to URL | JSON body | HTTP response |
| `prompt` | Single-turn LLM evaluation | Context | yes/no decision |
| `agent` | Spawns subagent | Task context | Verification result |

## Exit Codes

| Code | Meaning | Behavior |
|---|---|---|
| `0` | Success | Parse stdout for JSON output; allow action |
| `2` | Block | Ignore stdout; stderr fed to Claude; block action |
| Other | Non-blocking error | stderr shown in verbose mode; continue |

## JSON Output Format (exit 0)

```json
{
  "continue": true,
  "decision": "block",
  "reason": "explanation",
  "suppressOutput": false,
  "systemMessage": "warning to user",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "...",
    "updatedInput": { "command": "modified input" },
    "additionalContext": "context for Claude"
  }
}
```

## Environment Variables

| Variable | Available In | Description |
|---|---|---|
| `$CLAUDE_PROJECT_DIR` | All hooks | Project root (always quote for spaces) |
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Plugin installation directory |
| `${CLAUDE_PLUGIN_DATA}` | Plugin hooks | Plugin persistent data directory |
| `$CLAUDE_ENV_FILE` | SessionStart, CwdChanged, FileChanged | Env file path |

## Best Practices

- Keep hooks fast (SessionStart runs every session)
- Always validate JSON input (shell profiles can break parsing)
- Use `"if"` field for narrow filtering to reduce process overhead
- Check `stop_hook_active: true` in Stop hooks to prevent infinite loops
- Prefer exit 0 + JSON for structured control over raw exit codes
- Use `async: true` for non-blocking background hooks (logging, telemetry)
- Use `${CLAUDE_PLUGIN_ROOT}` in plugin hooks to reference scripts
