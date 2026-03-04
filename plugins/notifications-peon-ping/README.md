# Plugin Notifications PeonPing

Notifications sonores gaming (Warcraft, StarCraft, Portal, Zelda...) via [PeonPing](https://github.com/PeonPing/peon-ping).

> **Incompatibilité** : Ce plugin est mutuellement exclusif avec `notifications-system`. N'installez qu'un seul des deux pour éviter les doubles notifications.

## Installation

```bash
/plugin install notifications-peon-ping@angelo-plugins
```

Puis lancer le wizard de configuration :

```
/peon-ping-setup
```

Le wizard installe PeonPing CLI, choisit un pack de sons, configure le volume et teste le tout.

## Prérequis

- [PeonPing CLI](https://github.com/PeonPing/peon-ping) installé et dans le PATH
- Le skill `/peon-ping-setup` peut l'installer automatiquement

## Fonctionnalités

| Événement | Event PeonPing | Quand |
|-----------|---------------|-------|
| **Stop** | `task.complete` | Claude termine une réponse |
| **Notification** | `input.required` | Claude demande une interaction (permission outil, question) |

## Packs de sons disponibles

| Pack | Univers | Exemples |
|------|---------|----------|
| **peon** | Warcraft | "Work complete!", "More work?" |
| **glados** | Portal | Citations de GLaDOS |
| **kerrigan** | StarCraft | Citations de Kerrigan |
| **navi** | Zelda | "Hey! Listen!" |

Voir la [liste complète](https://github.com/PeonPing/peon-ping#packs) dans la documentation PeonPing.

## Configuration manuelle

Si vous préférez ne pas utiliser le wizard :

```bash
# Installer PeonPing (macOS)
brew tap PeonPing/tap
brew install peon-ping

# Choisir un pack
peon config set pack peon

# Régler le volume
peon config set volume 80

# Tester
peon preview task.complete
```

## Graceful Degradation

Si PeonPing n'est pas installé, le plugin ne fait rien (exit 0 silencieux). Aucune erreur ne sera affichée.

## Structure

```
notifications-peon-ping/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json          # Hooks Stop + Notification → play.sh
├── scripts/
│   └── play.sh             # Wrapper qui appelle peon emit <event>
├── skills/
│   └── setup/
│       └── SKILL.md        # Wizard d'installation (/peon-ping-setup)
└── README.md
```

## Dépannage

### Pas de son

1. Vérifier que PeonPing est installé : `which peon`
2. Tester manuellement : `peon preview task.complete`
3. Vérifier le volume : `peon config get volume`
4. Vérifier le pack actif : `peon config get pack`

### PeonPing non trouvé

Relancer `/peon-ping-setup` ou installer manuellement depuis https://github.com/PeonPing/peon-ping.
