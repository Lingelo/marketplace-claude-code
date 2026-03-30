---
name: {{SKILL_NAME}}
description: {{DESCRIPTION}}
allowed-tools: {{ALLOWED_TOOLS}}
---

# {{TITLE}}

## Purpose

{{PURPOSE_DESCRIPTION}}

## Sub-commands

| Command | Description |
|---------|-------------|
| `/{{SKILL_NAME}}:{{SUB1}}` | {{SUB1_DESC}} |
| `/{{SKILL_NAME}}:{{SUB2}}` | {{SUB2_DESC}} |

## Routing

Parse `$ARGUMENTS` to determine the sub-command:

1. If argument matches `{{SUB1}}` → Execute {{SUB1}} workflow
2. If argument matches `{{SUB2}}` → Execute {{SUB2}} workflow
3. Otherwise → Show available sub-commands

## Workflows

### {{SUB1}}

{{SUB1_INSTRUCTIONS}}

### {{SUB2}}

{{SUB2_INSTRUCTIONS}}
