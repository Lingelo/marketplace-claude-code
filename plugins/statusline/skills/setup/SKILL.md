---
name: statusline-setup
description: Configure et installe la statusline Claude Code. Utiliser quand l'utilisateur demande d'installer, configurer ou setup la statusline, /statusline-setup, ou veut avoir une status line.
allowed-tools: Bash, Read, Edit, Write, Glob, AskUserQuestion
---

# Configuration Statusline v2.1.0

Configure la statusline Claude Code basee sur [hell0github/claude-statusline](https://github.com/hell0github/claude-statusline).

## Apercu

```
marketplace | 140k/168k [████████░░] | $19/$140 [███░░░│░░░] 13% | 16:46/18:00 | 235/min | ×1
     │              │                      │                          │            │       │
     │              │                      │                          │            │       └─ Sessions actives
     │              │                      │                          │            └─ Burn rate (tokens/min)
     │              │                      │                          └─ Heure actuelle / Reset fenetre 5h
     │              │                      └─ Fenetre 5h : cout / limite, % utilise
     │              └─ Context window : tokens / limite (168K)
     └─ Nom du projet
```

## Bugs connus et solutions

### macOS : Erreur `date -d`

Le repo source utilise `date -d` (syntaxe GNU/Linux) qui n'existe pas sur macOS.

**Solution automatique** : Le skill installe `coreutils` via Homebrew et patche les scripts pour utiliser `gdate`.

### show_monthly necessite payment_cycle_start_date

Si `show_monthly: true`, le champ `tracking.payment_cycle_start_date` est obligatoire.

**Solution** : Le skill demande la date de debut de cycle si l'utilisateur active le suivi mensuel.

## Instructions

### Phase 1 : Nettoyage de l'installation existante

**OBLIGATOIRE** : Toujours nettoyer avant d'installer pour eviter les conflits.

```bash
echo "=== Nettoyage statusline existante ===" && \
rm -f ~/.claude/statusline.sh 2>/dev/null && echo "  Shim supprime" || true && \
rm -rf ~/Projects/cc-statusline 2>/dev/null && echo "  Repo supprime" || true && \
echo "=== Nettoyage termine ==="
```

Ensuite, lire `~/.claude/settings.json` et **supprimer la section `statusLine`** si elle existe.

### Phase 2 : Verification et installation des prerequis

```bash
echo "=== Verification des prerequis ===" && \
echo "OS: $(uname -s)" && \
echo "jq: $(which jq > /dev/null 2>&1 && echo '✅' || echo '❌ REQUIS')" && \
echo "ccusage: $(which ccusage > /dev/null 2>&1 && echo '✅' || echo '⚠️ Recommande')" && \
echo "git: $(which git > /dev/null 2>&1 && echo '✅' || echo '❌ REQUIS')" && \
if [ "$(uname -s)" = "Darwin" ]; then
  echo "gdate: $(which gdate > /dev/null 2>&1 && echo '✅' || echo '❌ REQUIS sur macOS')"
fi
```

**Installation automatique des prerequis manquants :**

Si `jq` manque :
```bash
# macOS
brew install jq
# Linux
sudo apt install jq
```

Si `ccusage` manque (recommande mais optionnel) :
```bash
npm install -g ccusage
```

**Sur macOS, si `gdate` manque, installer automatiquement coreutils :**
```bash
if [ "$(uname -s)" = "Darwin" ] && ! which gdate > /dev/null 2>&1; then
  echo "Installation de coreutils (gdate)..."
  brew install coreutils
fi
```

### Phase 3 : Choix du mode de facturation

Utiliser AskUserQuestion :

| Option | Description |
|--------|-------------|
| `api` | Pay-as-you-go / API Usage - Pas de limite hebdomadaire |
| `max20x` | Claude Max 20x - $200/mois, 220K tokens/5h, $850/semaine |
| `max5x` | Claude Max 5x - $100/mois, 88K tokens/5h, $500/semaine |
| `pro` | Claude Pro - $20/mois, 19K tokens/5h, $300/semaine |

### Phase 4 : Installation

```bash
mkdir -p ~/Projects && \
git clone https://github.com/hell0github/claude-statusline.git ~/Projects/cc-statusline && \
mkdir -p ~/Projects/cc-statusline/data && \
cp ~/Projects/cc-statusline/config/config.example.json ~/Projects/cc-statusline/config/config.json && \
echo "✅ Repo clone dans ~/Projects/cc-statusline"
```

### Phase 5 : Patch macOS (si Darwin)

**IMPORTANT** : Cette phase est obligatoire sur macOS pour corriger le bug `date -d`.

Verifier si on est sur macOS et appliquer le patch automatiquement :

```bash
if [ "$(uname -s)" = "Darwin" ]; then
  sed -i '' 's/date -d/gdate -d/g' ~/Projects/cc-statusline/src/statusline-utils.sh
  sed -i '' 's/date -d/gdate -d/g' ~/Projects/cc-statusline/src/statusline.sh
  echo "✅ Patch macOS applique (date -> gdate)"
fi
```

Verifier que le patch a ete applique :
```bash
grep -c "gdate -d" ~/Projects/cc-statusline/src/statusline-utils.sh
# Doit retourner 8
```

### Phase 6 : Choix du format d'heure

Utiliser AskUserQuestion :

| Option | Exemple | Description |
|--------|---------|-------------|
| `24h` (Recommande) | 17:30/18:00 | Format 24 heures |
| `12h` | 5:30PM/6PM | Format 12 heures avec AM/PM |

**Appliquer le patch selon le choix :**

Si l'utilisateur choisit **24h**, appliquer ce patch :

```bash
# Patch format 24h pour CURRENT_TIME
sed -i '' 's/date "+%-l:%M%p"/date "+%H:%M"/g' ~/Projects/cc-statusline/src/statusline.sh
sed -i '' 's/date "+%I:%M%p"/date "+%H:%M"/g' ~/Projects/cc-statusline/src/statusline.sh

# Patch format 24h pour RESET_TIME (gdate sur macOS)
sed -i '' 's/"+%-l%p"/"+%H:%M"/g' ~/Projects/cc-statusline/src/statusline.sh

echo "✅ Format 24h applique"
```

Si l'utilisateur choisit **12h**, ne rien faire (c'est le format par defaut).

### Phase 7 : Configuration selon le mode

Lire et modifier `~/Projects/cc-statusline/config/config.json` :

#### Mode API (pay-as-you-go)

Modifier ces champs :
- `user.plan` : garder `"max20x"` (valeur fictive, pas de limites)
- `sections.show_five_hour_window` : `false`
- `sections.show_daily` : `false`
- `sections.show_weekly` : `false`
- `sections.show_monthly` : `false`
- `sections.show_timer` : `false`

#### Modes Subscription (pro, max5x, max20x)

Demander les preferences avec AskUserQuestion :

**Question 1 - Sections a afficher :**
- "Recommande" : Context + 5h window + Weekly + Timer + Burn rate + Sessions
- "Complet" : Toutes les sections incluant Monthly
- "Minimal" : Context + Burn rate uniquement

**Question 2 - Weekly display mode :**
- `recommend` : % journalier recommande [Recommande]
- `usage` : % d'utilisation hebdomadaire
- `avail` : % restant disponible

**Question 3 - Suivi mensuel (si "Complet" ou demande explicite) :**
- "Oui" : Activer le suivi du cout mensuel
- "Non" : Desactiver (par defaut)

**Si suivi mensuel active**, demander la date de debut du cycle de facturation avec AskUserQuestion :

Options predefinies :
- "Le 1er du mois" : Cycle commence le 1er
- "Le 15 du mois" : Cycle commence le 15
- "Desactiver monthly" : Ne pas activer le suivi mensuel

L'utilisateur peut aussi choisir "Other" pour saisir un jour personnalise (ex: "le 28", "7", "23").

**Construction de la date ISO** a partir du jour choisi :
- Prendre le jour du mois (1-31)
- Construire la date avec le mois courant et la timezone locale
- Format : `YYYY-MM-DDTHH:MM:SS-HH:MM`

Exemple :
```bash
# Si l'utilisateur dit "le 28" ou choisit le 28
# Construire : 2025-01-28T00:00:00-08:00

# Obtenir la timezone locale
TZ_OFFSET=$(date +%z | sed 's/\(..\)$/:\1/')
# Ex: -08:00 pour PST
```

Modifier `~/Projects/cc-statusline/config/config.json` :

1. Changer `user.plan` vers le plan choisi (`pro`, `max5x`, ou `max20x`)

2. Configurer les sections selon le choix

3. Configurer `weekly_display_mode` selon le choix

4. **Si suivi mensuel active** :
   - Mettre `sections.show_monthly: true`
   - Configurer `tracking.payment_cycle_start_date` avec la date ISO fournie

   Exemple :
   ```json
   {
     "sections": {
       "show_monthly": true
     },
     "tracking": {
       "payment_cycle_start_date": "2025-01-01T00:00:00-08:00"
     }
   }
   ```

### Phase 8 : Creation du shim

```bash
cat > ~/.claude/statusline.sh << 'EOF'
#!/bin/bash
exec "$HOME/Projects/cc-statusline/src/statusline.sh" "$@"
EOF
chmod +x ~/.claude/statusline.sh && \
echo "✅ Shim cree dans ~/.claude/statusline.sh"
```

### Phase 9 : Configuration settings.json

Lire `~/.claude/settings.json` et ajouter/verifier la section `statusLine` :

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 0
  }
}
```

### Phase 10 : Test

```bash
echo '{"workspace":{"current_dir":"~"},"transcript_path":""}' | ~/.claude/statusline.sh
```

**Si le test echoue avec "ERROR in statusline.sh"** :
- Sur macOS : Verifier que le patch gdate a ete applique (Phase 5)
- Verifier que `gdate` est installe (`brew install coreutils`)

**Si le test echoue avec "Configuration validation failed"** :
- Lire le message d'erreur et corriger le config.json en consequence
- Si "payment_cycle_start_date is required" : mettre `show_monthly: false`

### Phase 11 : Confirmation

Afficher ce resume :

```
✅ Statusline v2.1.0 configuree !

Mode : <api | pro | max5x | max20x>
Sections actives : <liste>
Weekly mode : <recommend | usage | avail>
Format heure : <24h | 12h>
<Si monthly actif : Cycle depuis <date>>
<Si macOS : Patch gdate applique ✅>

Fichiers :
- Config : ~/Projects/cc-statusline/config/config.json
- Shim : ~/.claude/statusline.sh

⚠️ Redemarrez Claude Code pour appliquer.
```

**Puis afficher le guide de lecture de la statusline :**

```
📊 Comprendre la statusline :

Exemple : marketplace | 140k/168k [████░░] | $15/$140 [██│░░░] 10% | weekly 77% | total $135 | 17:26/19:00 (1h 33m) | 56/min | ×2

┌─────────────────────┬────────────────────────────────────────────────────────┐
│ Segment             │ Signification                                          │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ marketplace         │ Nom du projet (dossier courant)                        │
│ 140k/168k [████░░]  │ Context window : tokens utilises / limite (168K)       │
│ $15/$140 [██│░░] 10%│ Fenetre 5h : cout actuel / limite, % de la limite      │
│ weekly 77%          │ Utilisation hebdomadaire (mode usage)                  │
│   ou recom 14%      │ % journalier recommande pour finir le budget (mode recommend) │
│   ou avail 23%      │ % restant disponible cette semaine (mode avail)        │
│ total $135          │ Cout total du mois (depuis date cycle)                 │
│ 17:26/19:00 (1h 33m)│ Heure actuelle / reset 5h, temps restant               │
│ 56/min              │ Burn rate : tokens consommes par minute                │
│ ×2                  │ Nombre de sessions Claude Code actives                 │
└─────────────────────┴────────────────────────────────────────────────────────┘

Couleurs :
- Vert : usage normal
- Orange : attention, approche des limites
- Rouge : limite atteinte ou depassee
```

```
⚠️ Difference entre statusline et interface Claude (/status) :

┌─────────────────────┬─────────────────────────────────────────────────────────┐
│ Source              │ Ce qu'elle mesure                                       │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ Interface Claude    │ Usage API reel mesure par Anthropic (serveur)           │
│ (/status)           │ = donnees officielles, peut inclure usage web/mobile    │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ Statusline          │ Cout estime localement par ccusage depuis les           │
│ (ccusage)           │ transcripts (~/.claude/projects/)                       │
│                     │ = uniquement Claude Code, pas web/mobile                │
└─────────────────────┴─────────────────────────────────────────────────────────┘

Calcul du % weekly dans la statusline : cout_estime / limite_hebdo_plan

Limites hebdomadaires par plan :
┌──────────┬──────────────┬─────────────────┬─────────────────────────────────┐
│ Plan     │ Limite hebdo │ Tokens/5h       │ Exemple                         │
├──────────┼──────────────┼─────────────────┼─────────────────────────────────┤
│ pro      │ $300/semaine │ 19K tokens/5h   │ $150 depenses = 50% weekly      │
│ max5x    │ $500/semaine │ 88K tokens/5h   │ $390 depenses = 78% weekly      │
│ max20x   │ $850/semaine │ 220K tokens/5h  │ $425 depenses = 50% weekly      │
│ api      │ Pas de limite│ Pay-as-you-go   │ weekly desactive                │
└──────────┴──────────────┴─────────────────┴─────────────────────────────────┘

Note : Un ecart entre les 2 sources est normal (methodes de calcul differentes).
```

```
Commandes utiles :
- Modifier config : edit ~/Projects/cc-statusline/config/config.json
- Mise a jour : cd ~/Projects/cc-statusline && git pull
- Reconfigurer : demander "installe la statusline"
```

## Depannage

### Erreur "gdate: command not found" sur macOS

Installer coreutils :
```bash
brew install coreutils
```

### Erreur "ERROR in statusline.sh" sur macOS apres patch

Verifier que le patch a ete applique :
```bash
grep "gdate -d" ~/Projects/cc-statusline/src/statusline-utils.sh
```

Si aucun resultat, reappliquer le patch :
```bash
sed -i '' 's/date -d/gdate -d/g' ~/Projects/cc-statusline/src/statusline-utils.sh
sed -i '' 's/date -d/gdate -d/g' ~/Projects/cc-statusline/src/statusline.sh
```

### Erreur "payment_cycle_start_date is required"

Mettre `show_monthly: false` dans config.json.

### La statusline ne s'affiche pas

```bash
ls -la ~/.claude/statusline.sh
cat ~/.claude/settings.json | jq '.statusLine'
echo '{"workspace":{"current_dir":"~"},"transcript_path":""}' | ~/.claude/statusline.sh
```

### Changer le format d'heure apres installation

Pour passer en 24h :
```bash
sed -i '' 's/date "+%-l:%M%p"/date "+%H:%M"/g' ~/Projects/cc-statusline/src/statusline.sh
sed -i '' 's/date "+%I:%M%p"/date "+%H:%M"/g' ~/Projects/cc-statusline/src/statusline.sh
sed -i '' 's/"+%-l%p"/"+%H:%M"/g' ~/Projects/cc-statusline/src/statusline.sh
```

Pour revenir en 12h (AM/PM), reinstaller le repo et reappliquer les patches.

### Reinstaller

Relancer ce skill - le nettoyage est automatique en Phase 1.

### Mise a jour du repo (attention aux patches)

Apres un `git pull`, les patches macOS et format heure seront ecrases. Re-appliquer :
```bash
cd ~/Projects/cc-statusline
git pull

# Re-appliquer patch macOS si Darwin
if [ "$(uname -s)" = "Darwin" ]; then
  sed -i '' 's/date -d/gdate -d/g' src/statusline-utils.sh
  sed -i '' 's/date -d/gdate -d/g' src/statusline.sh
fi

# Re-appliquer patch 24h si souhaite
sed -i '' 's/date "+%-l:%M%p"/date "+%H:%M"/g' src/statusline.sh
sed -i '' 's/date "+%I:%M%p"/date "+%H:%M"/g' src/statusline.sh
sed -i '' 's/"+%-l%p"/"+%H:%M"/g' src/statusline.sh
```
