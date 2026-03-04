---
name: peon-ping-setup
description: "Install PeonPing gaming notifications and register Claude Code hooks"
allowed-tools:
  - Bash
---

# PeonPing Setup

Install PeonPing and register its Claude Code hooks. This skill delegates entirely to PeonPing's native setup — no custom logic.

## Steps

### 1. Check if PeonPing is installed

```bash
which peon 2>/dev/null && peon status 2>&1 || echo "PEON_NOT_FOUND"
```

If `PEON_NOT_FOUND`, install it:

**macOS:**
```bash
brew tap PeonPing/tap && brew install peon-ping
```

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/PeonPing/peon-ping/main/install.sh | bash
```

If install fails, show the error and link to https://github.com/PeonPing/peon-ping. STOP.

### 2. Run native setup

```bash
peon-ping-setup
```

This registers all Claude Code hooks and installs 5 default sound packs. Show the full output to the user.

### 3. Show available packs and current config

```bash
peon packs list
peon status
```

Display the results and tell the user:

> PeonPing est installé et configuré ! Hooks Claude Code enregistrés.
>
> **Pour changer de pack :**
> ```
> peon packs list --registry    # voir tous les packs
> peon packs install <pack>     # installer un pack
> peon packs use <pack>         # activer un pack
> ```
>
> **Pour configurer :**
> ```
> peon volume 0.8               # régler le volume
> peon notifications on/off     # notifications desktop
> peon preview task.complete    # tester le son
> ```
