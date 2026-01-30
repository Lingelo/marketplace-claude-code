# Statusline Plugin v2.0.0

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

## Fonctionnalites

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
- **ccusage** : `npm install -g ccusage`
- **bash** : Version 4+ recommandee (inclus dans Linux/WSL, `brew install bash` sur macOS)

### Recommande

- **Node.js** : Pour ccusage

## Installation

### Option 1 : Via l'agent (recommande)

```
/statusline-setup
```

L'agent va :
1. Cloner le repo dans `~/Projects/cc-statusline`
2. Creer le shim dans `~/.claude/statusline.sh`
3. Configurer `~/.claude/settings.json`
4. Vous guider pour la configuration

### Option 2 : Installation manuelle

```bash
# 1. Cloner le repo
git clone https://github.com/hell0github/claude-statusline.git ~/Projects/cc-statusline

# 2. Copier et configurer
cp ~/Projects/cc-statusline/config/config.example.json ~/Projects/cc-statusline/config/config.json
# Editer config.json (plan, sections, etc.)

# 3. Creer le shim
cat > ~/.claude/statusline.sh << 'EOF'
#!/bin/bash
exec "$HOME/Projects/cc-statusline/src/statusline.sh" "$@"
EOF
chmod +x ~/.claude/statusline.sh

# 4. Creer le dossier data
mkdir -p ~/Projects/cc-statusline/data

# 5. Configurer settings.json
# Ajouter dans ~/.claude/settings.json :
# "statusLine": {
#   "type": "command",
#   "command": "~/.claude/statusline.sh",
#   "padding": 0
# }

# 6. Redemarrer Claude Code
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

## Sources

- [hell0github/claude-statusline](https://github.com/hell0github/claude-statusline)
- [ccusage - npm](https://www.npmjs.com/package/ccusage)
- [Claude Code Status Line Docs](https://claude.com/claude-code)
