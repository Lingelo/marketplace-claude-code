# Statusline Plugin v2.1.0

Une statusline avancee pour Claude Code basee sur [hell0github/claude-statusline](https://github.com/hell0github/claude-statusline).

## Apercu

```
marketplace | 140k/168k [████████░░] | $19/$140 [███░░░│░░░] 13% | 16:46/18:00 (2h 13m) | 235/min | ×1
```

**Sections :**
- **Projet** : Nom du repertoire (orange)
- **Context** : `140k/168k [bar]` - Tokens utilises/limite
- **5h Window** : `$19/$140 [bar│] 13%` - Cout/limite avec projection (│)
- **Timer** : `16:46/18:00 (2h 13m)` - Heure actuelle/reset (countdown, format 24h)
- **Burn rate** : `235/min` - Tokens/minute
- **Sessions** : `×1` - Sessions Claude Code actives

## Modes supportes

| Mode | Description | Sections affichees |
|------|-------------|-------------------|
| `api` | Pay-as-you-go / API Usage | Contexte, burn rate, sessions |
| `pro` | Claude Pro ($20/mois) | Toutes sections configurables |
| `max5x` | Claude Max 5x ($100/mois) | Toutes sections configurables |
| `max20x` | Claude Max 20x ($200/mois) | Toutes sections configurables |

## Fonctionnalites

- **Support API Usage** : Mode sans limites de couts pour les utilisateurs pay-as-you-go
- **Nettoyage automatique** : Suppression de l'ancienne installation avant setup
- **Tracking multi-periodes** : Context, 5h window, daily, weekly, monthly
- **Barres multi-couches** : 3 niveaux (vert/orange/rouge) avec seuils configurables
- **Projection intelligente** : Separateur `│` montrant la projection burn-rate
- **Timer** : Countdown vers le reset du bloc 5h
- **Token burn rate** : Tokens/minute en temps reel
- **Sessions actives** : Nombre de projets Claude Code ouverts
- **Caching intelligent** : Evite les appels excessifs a ccusage

## Compatibilite

- **macOS** (Intel & Apple Silicon)
- **Linux** (Ubuntu, Debian, etc.)
- **Windows WSL** (Windows Subsystem for Linux)

## Prerequis

### Obligatoire

- **jq** : `brew install jq` (macOS) | `apt install jq` (Linux/WSL)
- **git** : Pour cloner le repo

### Recommande

- **ccusage** : `npm install -g ccusage` - Pour le tracking des couts
- **bash 4+** : `brew install bash` sur macOS

## Installation

### Via le skill (recommande)

```
/statusline-setup
```

Le skill va :
1. **Nettoyer** l'installation existante (shim, repo, config)
2. **Verifier** les prerequis (jq, ccusage, git)
3. **Demander** le mode (API usage ou subscription)
4. **Cloner** le repo dans `~/Projects/cc-statusline`
5. **Configurer** selon vos preferences
6. **Creer** le shim dans `~/.claude/statusline.sh`
7. **Configurer** `~/.claude/settings.json`
8. **Tester** l'installation

### Installation manuelle

```bash
# 1. Nettoyer (si existant)
rm -f ~/.claude/statusline.sh
rm -rf ~/Projects/cc-statusline

# 2. Cloner le repo
git clone https://github.com/hell0github/claude-statusline.git ~/Projects/cc-statusline

# 3. Copier et configurer
cp ~/Projects/cc-statusline/config/config.example.json ~/Projects/cc-statusline/config/config.json
# Editer config.json (plan, sections, etc.)

# 4. Creer le dossier data
mkdir -p ~/Projects/cc-statusline/data

# 5. Creer le shim
cat > ~/.claude/statusline.sh << 'EOF'
#!/bin/bash
exec "$HOME/Projects/cc-statusline/src/statusline.sh" "$@"
EOF
chmod +x ~/.claude/statusline.sh

# 6. Configurer settings.json
# Ajouter dans ~/.claude/settings.json :
# "statusLine": {
#   "type": "command",
#   "command": "~/.claude/statusline.sh",
#   "padding": 0
# }

# 7. Redemarrer Claude Code
```

## Configuration

Le fichier de config est `~/Projects/cc-statusline/config/config.json`.

### Plan

```json
{
  "user": {
    "plan": "max5x"
  }
}
```

Options : `pro`, `max5x`, `max20x`

**Note** : Pour le mode API usage, utilisez `max20x` mais desactivez les sections de couts.

### Sections

```json
{
  "sections": {
    "show_directory": true,
    "show_context": true,
    "show_five_hour_window": true,
    "show_daily": true,
    "show_weekly": true,
    "show_monthly": false,
    "show_timer": true,
    "show_token_rate": true,
    "show_sessions": true,
    "weekly_display_mode": "recommend"
  }
}
```

### Configuration mode API (pay-as-you-go)

Pour les utilisateurs API Usage sans limites :

```json
{
  "user": {
    "plan": "max20x"
  },
  "sections": {
    "show_directory": true,
    "show_context": true,
    "show_five_hour_window": false,
    "show_daily": false,
    "show_weekly": false,
    "show_monthly": false,
    "show_timer": false,
    "show_token_rate": true,
    "show_sessions": true
  }
}
```

### Weekly Display Modes

- `usage` : Affiche le % d'utilisation hebdo
- `avail` : Affiche le % restant disponible
- `recommend` : Affiche le % journalier recommande

### Tracking (pour daily/weekly precis)

Pour synchroniser avec le reset officiel Anthropic :

```json
{
  "tracking": {
    "weekly_scheme": "ccusage_r",
    "official_reset_date": "2025-01-29T15:00:00-08:00"
  }
}
```

Trouver la date de reset : [console.anthropic.com](https://console.anthropic.com) > Usage > "Resets [date/time]"

### Monthly (optionnel)

```json
{
  "sections": {
    "show_monthly": true
  },
  "tracking": {
    "payment_cycle_start_date": "2025-01-01T15:00:00-08:00"
  }
}
```

## Architecture

### Pattern Shim

```
Claude Code → ~/.claude/statusline.sh (shim 2 lignes)
                        ↓
              ~/Projects/cc-statusline/src/statusline.sh (implementation)
```

**Avantages :**
- Interface stable (Claude Code appelle toujours le meme chemin)
- Mise a jour facile (`git pull` dans le repo)
- Code reutilisable entre projets

### Structure du repo

```
~/Projects/cc-statusline/
├── src/
│   ├── statusline.sh         # Script principal (3-stage pipeline)
│   ├── statusline-utils.sh   # Calculs de periodes
│   ├── statusline-layers.sh  # Calculs multi-couches
│   └── statusline-cache.sh   # Gestion du cache
├── config/
│   ├── config.json           # Votre config (gitignored)
│   └── config.example.json   # Template
├── data/                     # Cache (gitignored)
└── tools/
    └── calibrate_weekly_usage.sh
```

## Mise a jour

```bash
cd ~/Projects/cc-statusline
git pull
```

## Comportement

### Rafraichissement

La statusline **ne s'affiche pas en temps reel**. Elle se met a jour uniquement lors d'evenements :
- Soumission d'un message
- Reception d'une reponse
- Autres interactions avec Claude Code

**Comportements normaux :**
- Pas de statusline visible immediatement au demarrage — elle apparait apres la premiere interaction
- Pas de mise a jour pendant la saisie — elle se rafraichit a la soumission

C'est le comportement standard de Claude Code, pas un bug.

## Depannage

### La statusline ne s'affiche pas

```bash
# Verifier le shim
ls -la ~/.claude/statusline.sh

# Tester manuellement
echo '{"workspace":{"current_dir":"~"},"transcript_path":""}' | ~/.claude/statusline.sh
```

### Erreur de validation config

Verifier que :
- `user.plan` est defini (`pro`, `max5x`, `max20x`)
- Si `show_monthly: true`, `payment_cycle_start_date` est requis
- Si `weekly_scheme: ccusage_r`, `official_reset_date` est requis

### Decalage avec la console Anthropic

Utiliser l'outil de calibration :
```bash
~/Projects/cc-statusline/tools/calibrate_weekly_usage.sh 18.5
```

Ou configurer `tracking.weekly_baseline_percent` dans config.json.

### Reinstaller completement

Lancer `/statusline-setup` - le nettoyage automatique supprimera l'ancienne installation.

## Changelog

### v2.1.0
- **Nouveau** : Support mode API Usage (pay-as-you-go)
- **Nouveau** : Nettoyage automatique de l'installation existante
- **Nouveau** : Conversion de commande vers skill pour meilleur guidage
- **Amelioration** : Detection et configuration simplifiees

### v2.0.0
- Migration vers [hell0github/claude-statusline](https://github.com/hell0github/claude-statusline)
- Pattern shim pour mises a jour faciles
- Support multi-periodes (daily, weekly, monthly)

## Sources

- [hell0github/claude-statusline](https://github.com/hell0github/claude-statusline)
- [ccusage - npm](https://www.npmjs.com/package/ccusage)
- [Claude Code Status Line Docs](https://claude.com/claude-code)
