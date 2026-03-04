# Plugin Notifications PeonPing

Notifications sonores et visuelles gaming (Warcraft, StarCraft, Portal, Zelda...) via [PeonPing](https://github.com/PeonPing/peon-ping).

PeonPing gère ses propres hooks Claude Code nativement. Ce plugin sert de **point d'entrée marketplace** pour découvrir et installer PeonPing.

> **Incompatibilité** : Ce plugin est mutuellement exclusif avec `notifications-system` sur les événements `Stop` et `Notification`. N'installez qu'un seul des deux pour éviter les doubles notifications.

## Installation rapide

Le skill `/peon-ping-setup` automatise l'installation :

```
/peon-ping-setup
```

Il installe PeonPing CLI (si absent), lance le setup natif et affiche les commandes de personnalisation.

## Installation manuelle

### 1. Installer PeonPing CLI

**macOS (Homebrew) :**
```bash
brew tap PeonPing/tap
brew install peon-ping
```

**Linux :**
```bash
curl -fsSL https://raw.githubusercontent.com/PeonPing/peon-ping/main/install.sh | bash
```

### 2. Lancer le setup natif

```bash
peon-ping-setup
```

> **Important** : Cette commande n'est **pas interactive**. Elle s'exécute d'un coup et :
> - Auto-détecte Claude Code
> - Enregistre les hooks dans `~/.claude/settings.json`
> - Installe 5 packs de sons par défaut
> - Configure les skills natifs PeonPing (`/peon-ping-toggle`, `/peon-ping-config`, `/peon-ping-use`, `/peon-ping-log`)

**Options :**
```bash
peon-ping-setup --packs=peon,glados    # Installer des packs spécifiques
peon-ping-setup --all                   # Installer tous les packs (+170)
```

### 3. Personnaliser (après le setup)

Le setup installe les défauts. La personnalisation se fait ensuite avec les commandes `peon` :

**Choisir un pack de sons :**
```bash
peon packs list                        # Voir les packs installés
peon packs list --registry             # Voir tous les packs disponibles (+170)
peon packs install kaamelott           # Installer un nouveau pack
peon packs use kaamelott               # Activer un pack
```

**Régler le volume :**
```bash
peon volume                            # Voir le volume actuel
peon volume 0.8                        # Régler (0.0 à 1.0)
```

**Notifications desktop (overlay visuel) :**
```bash
peon notifications overlay             # Grandes bannières (défaut)
peon notifications standard            # Notifications système classiques
peon notifications off                 # Son uniquement, pas de visuel
```

**Tester :**
```bash
peon preview task.complete             # Son de fin de tâche
peon preview input.required            # Son de demande d'attention
```

## Comment ça marche

PeonPing enregistre un seul script (`peon.sh`) comme hook pour tous les événements Claude Code. Il détecte automatiquement le type d'événement et joue le son correspondant :

| Événement Claude Code | Catégorie PeonPing | Quand |
|----------------------|-------------------|-------|
| **Stop** | `task.complete` | Claude termine une réponse |
| **Notification** | `input.required` | Claude demande une interaction |
| **SessionStart** | `session.start` | Démarrage d'une session |
| **PermissionRequest** | `input.required` | Demande de permission |
| **PostToolUseFailure** | `task.error` | Un outil échoue |

## Packs de sons populaires

| Pack | Univers | Exemples |
|------|---------|----------|
| **peon** | Warcraft | "Work complete!", "More work?" |
| **glados** | Portal | Citations de GLaDOS |
| **kaamelott** | Kaamelott | Citations de la série |
| **sc_kerrigan** | StarCraft | Citations de Kerrigan |
| **jarvis** | Iron Man | J.A.R.V.I.S. |
| **r2d2** | Star Wars | R2-D2 |

+170 autres. Voir `peon packs list --registry`.

## Commandes utiles

### Skills Claude Code (fournis par PeonPing)

| Skill | Description |
|-------|-------------|
| `/peon-ping-toggle` | Activer/désactiver les sons |
| `/peon-ping-config` | Modifier la configuration |
| `/peon-ping-use` | Changer de pack |
| `/peon-ping-log` | Voir les logs |

### Commandes terminal

| Commande | Description |
|----------|-------------|
| `peon status` | Vérifier le statut complet |
| `peon volume [0.0-1.0]` | Voir/changer le volume |
| `peon packs list` | Lister les packs installés |
| `peon packs list --registry` | Lister tous les packs disponibles |
| `peon packs install <pack>` | Installer un pack |
| `peon packs use <pack>` | Activer un pack |
| `peon preview <category>` | Tester un son |
| `peon toggle` | Mute/unmute |
| `peon notifications on/off` | Activer/désactiver le visuel |

## Structure

```
notifications-peon-ping/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── setup/
│       └── SKILL.md        # /peon-ping-setup (install + setup natif)
└── README.md
```

## Dépannage

### Pas de son

1. Vérifier l'installation : `which peon`
2. Vérifier le statut : `peon status`
3. Tester manuellement : `peon preview task.complete`
4. Vérifier le volume : `peon volume`
5. Vérifier les hooks Claude Code : `cat ~/.claude/settings.json | grep peon`

### Hooks manquants

Relancer le setup natif :
```bash
peon-ping-setup
```

### PeonPing non trouvé

Installer depuis https://github.com/PeonPing/peon-ping.
