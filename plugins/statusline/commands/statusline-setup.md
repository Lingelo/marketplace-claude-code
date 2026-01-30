# Configuration de la Statusline v2.0.0

Configure la statusline Claude Code basee sur [hell0github/claude-statusline](https://github.com/hell0github/claude-statusline).

## Instructions

### 1. Verifier les prerequis

Executer cette commande :
```bash
echo "=== Verification des prerequis ===" && \
echo "" && \
echo "OS: $(uname -s)" && \
echo "" && \
echo "jq:" && \
(which jq > /dev/null 2>&1 && echo "  ✅ Installe ($(jq --version))" || echo "  ❌ Non installe - brew install jq (macOS) | apt install jq (Linux)") && \
echo "" && \
echo "ccusage:" && \
(which ccusage > /dev/null 2>&1 && echo "  ✅ Installe" || echo "  ❌ Non installe - npm install -g ccusage") && \
echo "" && \
echo "git:" && \
(which git > /dev/null 2>&1 && echo "  ✅ Installe" || echo "  ❌ Non installe") && \
echo "" && \
echo "bash:" && \
echo "  Version: $BASH_VERSION"
```

**Si jq ou ccusage manque**, proposer l'installation avec AskUserQuestion.

**Plateformes supportees :** macOS, Linux, Windows WSL

### 2. Verifier installation existante

```bash
if [ -d ~/Projects/cc-statusline ]; then
    echo "✅ cc-statusline deja clone"
    cd ~/Projects/cc-statusline && git log --oneline -1
elif [ -f ~/.claude/statusline.sh ]; then
    echo "⚠️ Ancien format detecte"
else
    echo "ℹ️ Nouvelle installation"
fi
```

### 3. Cloner ou mettre a jour le repo

**Nouvelle installation :**
```bash
mkdir -p ~/Projects
git clone https://github.com/hell0github/claude-statusline.git ~/Projects/cc-statusline
mkdir -p ~/Projects/cc-statusline/data
cp ~/Projects/cc-statusline/config/config.example.json ~/Projects/cc-statusline/config/config.json
```

**Mise a jour :**
```bash
cd ~/Projects/cc-statusline && git pull
```

### 4. Demander les preferences

Utiliser AskUserQuestion :

**Question 1 - Plan :**
- `max5x` : Claude Max 5x (88K tokens/5h, $500/semaine) [Recommande]
- `max20x` : Claude Max 20x (220K tokens/5h, $850/semaine)
- `pro` : Claude Pro (19K tokens/5h, $300/semaine)

**Question 2 - Sections a afficher (multiSelect: true) :**
- Context window [Recommande]
- 5-hour cost window [Recommande]
- Daily tracker
- Weekly tracker [Recommande]
- Monthly tracker
- Timer (countdown reset) [Recommande]
- Token burn rate [Recommande]
- Active sessions [Recommande]

**Question 3 - Weekly display mode :**
- `recommend` : % journalier recommande pour finir le budget [Recommande]
- `usage` : % d'utilisation hebdomadaire
- `avail` : % restant disponible

### 5. Configurer le fichier config.json

Lire `~/Projects/cc-statusline/config/config.json` et le modifier selon les preferences.

**Champs a modifier :**
- `user.plan` : Le plan choisi
- `sections.*` : Les sections activees/desactivees
- `sections.weekly_display_mode` : Le mode choisi

**Si show_monthly est true**, demander la date de debut du cycle de facturation.

**Si l'utilisateur veut synchroniser avec Anthropic** (pour daily/weekly precis), demander la date de reset officielle visible sur console.anthropic.com et configurer :
```json
{
  "tracking": {
    "weekly_scheme": "ccusage_r",
    "official_reset_date": "YYYY-MM-DDTHH:MM:SS-HH:MM"
  }
}
```

### 6. Creer le shim

```bash
cat > ~/.claude/statusline.sh << 'EOF'
#!/bin/bash
exec "$HOME/Projects/cc-statusline/src/statusline.sh" "$@"
EOF
chmod +x ~/.claude/statusline.sh
```

### 7. Configurer settings.json

Lire `~/.claude/settings.json` et ajouter/mettre a jour :

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 0
  }
}
```

### 8. Tester

```bash
echo '{"workspace":{"current_dir":"~"},"transcript_path":""}' | ~/.claude/statusline.sh
```

### 9. Confirmer

```
Statusline v2.0.0 configuree !

Configuration :
- Plan : <plan>
- Sections : <sections actives>
- Weekly mode : <mode>

Fichiers :
- Repo : ~/Projects/cc-statusline/
- Config : ~/Projects/cc-statusline/config/config.json
- Shim : ~/.claude/statusline.sh

Redemarrez Claude Code pour appliquer.

Commandes utiles :
- Modifier config : edit ~/Projects/cc-statusline/config/config.json
- Mise a jour : cd ~/Projects/cc-statusline && git pull
- Reconfigurer : /statusline-setup
```

## Exemple de sortie

```
marketplace | 140k/168k [████████░░] | $19/$140 [███░░░│░░░] 13% | 16:46/18:00 (2h 13m) | 235/min | ×1
```

**Sections :**
- `marketplace` : Nom du projet (orange)
- `140k/168k [bar]` : Context tokens (rose)
- `$19/$140 [bar│] 13%` : Cout 5h avec projection
- `16:46/18:00 (2h 13m)` : Timer (format 24h)
- `235/min` : Token burn rate
- `×1` : Sessions actives
