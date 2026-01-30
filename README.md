# Claude Code Marketplace

Marketplace de plugins pour Claude Code, fournissant des outils et workflows de développement.

## Plugins disponibles

| Plugin | Description | Composants |
|--------|-------------|------------|
| [**security**](plugins/security/README.md) | Bloque l'accès aux fichiers sensibles (.env, secrets, clés) | Hook |
| [**notifications**](plugins/notifications/README.md) | Sons et notifications visuelles | Hook |
| [**git**](plugins/git/README.md) | Commits conventionnels + push securisé (bloque main/master) | Skills |
| [**workflows**](plugins/workflows/README.md) | Workflow de développement Explore-Plan-Code-Test | Command, Agent |
| [**playwright**](plugins/playwright/README.md) | MCP Playwright + agents tests E2E (planner, generator, healer) | MCP, Agents |
| [**release-note**](plugins/release-note/README.md) | Génère des release notes depuis Jira via MCP Atlassian | Skill |
| [**statusline**](plugins/statusline/README.md) | Statusline avec suivi des coûts, git et support multi-plans | Command, Script |
| [**experts**](plugins/experts/README.md) | Agent architecte pour analyse de code et évolutions | Agent |
| [**maintenance**](plugins/maintenance/README.md) | Outils de maintenance (nettoyage plugins orphelins) | Command |
| [**figma**](plugins/figma/README.md) | Serveur MCP Figma pour interagir avec les designs | MCP |
| [**atlassian**](plugins/atlassian/README.md) | Serveur MCP Atlassian pour Jira et Confluence | MCP |

## Installation

### 1. Ajouter la Marketplace

```bash
/plugin marketplace add <YOUR_GIT_URL>
```

Ou via le mode interactif :
```bash
/plugin
# Aller dans l'onglet "Marketplaces" > "Add marketplace"
# Coller l'URL de votre repository git
```

### 2. Installer les plugins

**Interactif (recommandé) :**
```bash
/plugin
# Aller dans l'onglet "Discover" et sélectionner les plugins à installer
```

**Installation directe :**
```bash
/plugin install security@angelo-plugins
/plugin install notifications@angelo-plugins
/plugin install git@angelo-plugins
/plugin install workflows@angelo-plugins
/plugin install playwright@angelo-plugins
/plugin install release-note@angelo-plugins
/plugin install statusline@angelo-plugins
/plugin install experts@angelo-plugins
/plugin install maintenance@angelo-plugins
/plugin install figma@angelo-plugins
/plugin install atlassian@angelo-plugins
```

## Configuration équipe

Ajouter dans le `.claude/settings.json` de votre projet pour auto-configurer tous les membres de l'équipe :

```json
{
  "extraKnownMarketplaces": {
    "angelo-plugins": {
      "source": {
        "source": "git",
        "url": "<YOUR_GIT_URL>"
      }
    }
  },
  "enabledPlugins": {
    "security@angelo-plugins": true,
    "git@angelo-plugins": true
  }
}
```

## Gestion des plugins

| Commande | Description |
|----------|-------------|
| `/plugin` | Ouvrir le gestionnaire de plugins interactif |
| `/plugin install name@marketplace` | Installer un plugin |
| `/plugin uninstall name@marketplace` | Supprimer un plugin |
| `/plugin enable name@marketplace` | Activer un plugin désactivé |
| `/plugin disable name@marketplace` | Désactiver sans supprimer |
| `/plugin marketplace list` | Lister les marketplaces enregistrées |
| `/plugin marketplace update` | Mettre à jour les métadonnées |

## Exemples d'utilisation

### Plugin Security
Bloque automatiquement l'accès aux fichiers `.env`, `credentials.json`, `.pem`, etc.
Aucune commande nécessaire - fonctionne automatiquement via hook.

> **Note sécurité** : Ce plugin utilise des **hooks `PreToolUse`** plutôt que les `deny` rules de `settings.json`. Les deny rules ont des [bugs connus](https://github.com/anthropics/claude-code/issues/6699) où elles sont parfois ignorées. Les hooks avec exit code 2 garantissent un blocage fiable.

### Plugin Git
```bash
/commit
# Analyse les changements et cree un commit conventionnel avec le Jira de la branche

/push
# Pousse les commits (BLOQUE si sur main/master)
```

### Workflow EPCT
```bash
/epct
# Suit la méthodologie Explore → Plan → Code → Test

/epct-jira PROJ-123
# Récupère le contexte Jira puis lance le workflow EPCT
# Sans argument, demande le numéro de ticket
```
`/epct-jira` nécessite le MCP Atlassian configuré.

### Release Notes
```bash
/release-note team-alpha
# Génère une release note des tickets Done du sprint courant pour l'équipe

/release-note PROJ FEAT
# Génère une release note pour les projets spécifiés
```
Nécessite le MCP Atlassian configuré.

### Statusline
```bash
/statusline-setup
# Configure la statusline avec suivi des coûts, git, et support multi-plans (Pro, Max5, Max20, Pay-as-you-go)
```
Nécessite `jq` et optionnellement `ccusage`.

### Experts
```bash
# L'agent se déclenche sur les questions d'architecture
Analyse l'architecture du module orders
Comment découper ce service monolithique ?
Quelle est la dette technique de ce projet ?
```
Agent Opus pour analyses approfondies et propositions d'évolution.

### Maintenance
```bash
/plugin-clean
# Détecte et supprime les plugins orphelins ou en erreur
```

## Plugins MCP

Des serveurs MCP sont disponibles en tant que plugins pour une installation simplifiée :

| Plugin | Description | Installation |
|--------|-------------|--------------|
| **atlassian** | Jira et Confluence | `/plugin install atlassian@angelo-plugins` |
| **figma** | Designs Figma | `/plugin install figma@angelo-plugins` |
| **playwright** | Tests E2E (inclut le MCP) | `/plugin install playwright@angelo-plugins` |

### Utilisation avec les plugins

```bash
# Installer le MCP Atlassian pour /release-note et /epct-jira
/plugin install atlassian@angelo-plugins

# Installer Playwright pour les tests E2E
/plugin install playwright@angelo-plugins

# Installer Figma pour l'integration design
/plugin install figma@angelo-plugins
```

## Structure

```
marketplace-claude-code/
├── .claude-plugin/
│   └── marketplace.json      # Registre de la marketplace
├── plugins/
│   ├── security/             # Protection fichiers sensibles
│   ├── notifications/        # Notifications sonores
│   ├── git/                  # Commits + push securise
│   ├── workflows/            # Workflow EPCT
│   ├── playwright/           # MCP + Agents tests E2E
│   ├── release-note/         # Release notes Jira
│   ├── statusline/           # Statusline personnalisée
│   ├── experts/              # Agent architecte
│   ├── maintenance/          # Outils de maintenance
│   ├── figma/                # MCP Figma
│   └── atlassian/            # MCP Atlassian
└── README.md
```

## Contribuer

1. Créer un nouveau plugin dans `plugins/votre-plugin/`
2. Ajouter `.claude-plugin/plugin.json` avec les métadonnées
3. Ajouter commands, agents, skills ou hooks selon les besoins
4. Enregistrer dans `.claude-plugin/marketplace.json`
5. Ajouter un `README.md` documentant votre plugin

## Licence

MIT
