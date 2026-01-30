# Plugin Notifications

Notifications sonores et visuelles quand Claude termine une tâche ou a besoin d'attention.

## Installation

```bash
/plugin install notifications@angelo-plugins
```

## Configuration

Créer le fichier `~/.claude/config/notifications.json` :

```bash
mkdir -p ~/.claude/config
```

```json
{
  "sound": true,
  "visual": true
}
```

**Exemples de configuration :**

| Mode | sound | visual |
|------|-------|--------|
| Son + Visuel (défaut) | `true` | `true` |
| Visuel uniquement | `false` | `true` |
| Son uniquement | `true` | `false` |
| Désactivé | `false` | `false` |

**Commandes rapides :**

```bash
# Visuel uniquement (pas de son)
echo '{"sound": false, "visual": true}' > ~/.claude/config/notifications.json

# Son uniquement (pas de notification visuelle)
echo '{"sound": true, "visual": false}' > ~/.claude/config/notifications.json

# Les deux (défaut)
echo '{"sound": true, "visual": true}' > ~/.claude/config/notifications.json
```

> **Note** : La configuration est lue à chaque notification, pas besoin de redémarrer Claude Code.

## Fonctionnalités

| Événement | Son | Quand |
|-----------|-----|-------|
| **Stop** | Son de complétion | Claude termine une réponse |
| **Notification** | Son d'attention | Claude demande une interaction (permission outil, question interactive, formulaire) |

> **Note** : Le son d'attention ne se déclenche pas après 60 sec d'inactivité (`idle_prompt`), uniquement lors d'interactions actives.

## Compatibilité

| OS | Son | Notification visuelle |
|----|-----|----------------------|
| **macOS** | `afplay` (natif) | `osascript` (natif) |
| **Linux** | `paplay` / `aplay` | `notify-send` (libnotify) |
| **Windows** | PowerShell SystemSounds | PowerShell Toast |

### macOS

Utilise les sons système :
- Complétion : `/System/Library/Sounds/Glass.aiff`
- Attention : `/System/Library/Sounds/Ping.aiff`

### Linux

Cherche les sons dans l'ordre :
1. `/usr/share/sounds/freedesktop/stereo/`
2. `/usr/share/sounds/ubuntu/stereo/`
3. `/usr/share/sounds/gnome/default/alerts/`
4. Fallback : terminal bell (`\x07`)

### Windows

Utilise PowerShell avec `System.Media.SystemSounds` :
- Complétion : `Asterisk`
- Attention : `Exclamation`

## Pourquoi ce plugin ?

Quand Claude travaille sur des tâches longues, vous pouvez faire autre chose et être notifié quand :
- Claude a terminé son travail
- Claude demande une permission ou pose une question interactive

Plus besoin de surveiller constamment le terminal !

## Structure

```
notifications/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json
├── scripts/
│   ├── notify.js          # Son + notification visuelle
│   └── install-deps.sh    # Installation dépendances Linux
└── README.md
```

## Dépannage

### Pas de son sur macOS

Vérifier que le volume n'est pas à zéro et que les sons système sont activés dans Préférences Système > Son.

### Linux : Installation des dépendances

Un script d'installation est fourni pour toutes les distributions :

```bash
# Depuis le répertoire du plugin
./scripts/install-deps.sh
```

Le script détecte automatiquement votre distribution (Debian/Ubuntu, Fedora/RHEL, Arch, openSUSE) et installe :
- `libnotify` — pour les notifications visuelles (`notify-send`)
- `pulseaudio-utils` — pour le son (`paplay`)

### Pas de son sur Windows

Vérifier que PowerShell est disponible et que les sons système sont activés.
