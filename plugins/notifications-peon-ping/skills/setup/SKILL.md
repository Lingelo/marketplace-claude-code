---
name: peon-ping-setup
description: "Install and configure PeonPing gaming notifications (Warcraft, StarCraft, Portal...)"
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---

# PeonPing Setup Wizard

You are a setup wizard for PeonPing gaming notifications. Guide the user through 5 phases.

## Phase 1 — Check Installation

Check if PeonPing is already installed:

```bash
which peon && peon --version
```

- If found: display the version and skip to Phase 3
- If not found: proceed to Phase 2

## Phase 2 — Install PeonPing

Detect the platform and install:

**macOS (Homebrew):**
```bash
brew tap PeonPing/tap
brew install peon-ping
```

**Linux / other (curl):**
```bash
curl -fsSL https://raw.githubusercontent.com/PeonPing/peon-ping/main/install.sh | bash
```

After install, verify:
```bash
peon --version
```

If installation fails, show the error and link to https://github.com/PeonPing/peon-ping for manual installation.

## Phase 3 — Choose Sound Pack

List available sound packs:

```bash
peon packs list
```

Ask the user which pack they want to use. Common packs:
- **peon** — Warcraft "Work complete!" / "More work?"
- **glados** — Portal GLaDOS quotes
- **kerrigan** — StarCraft Kerrigan quotes
- **navi** — Zelda "Hey! Listen!"

Set the chosen pack:
```bash
peon config set pack <chosen-pack>
```

## Phase 4 — Configure Options

Ask the user about:

1. **Volume** (0-100, default 80):
```bash
peon config set volume <value>
```

2. **Desktop overlay** (yes/no, default yes):
```bash
peon config set overlay <true|false>
```

## Phase 5 — Test

Run a test notification:

```bash
peon preview task.complete
```

Ask the user if they heard the sound. If not, troubleshoot:
- Check volume settings
- Check audio output device
- Try `peon preview input.required` as alternative

Once confirmed working, display a success message:

> PeonPing is configured! The `notifications-peon-ping` plugin will now play gaming sounds when Claude completes tasks or needs your attention.
>
> **Reminder:** Make sure `notifications-system` is NOT installed alongside this plugin to avoid double notifications.
