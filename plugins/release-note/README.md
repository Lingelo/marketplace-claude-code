# Release Note Plugin

Génère des release notes automatiques à partir des tickets Jira terminés du sprint courant.

## Prérequis

### MCP Atlassian (obligatoire)

Ce plugin nécessite le serveur **MCP Atlassian** pour fonctionner. Sans cette configuration, le skill ne pourra pas accéder aux données Jira.

#### Configuration

Ajouter dans le fichier `.mcp.json` de votre projet :

```json
{
  "mcpServers": {
    "Atlassian": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.atlassian.com/v1/sse"]
    }
  }
}
```

#### Authentification

Lors de la première utilisation, le serveur MCP Atlassian vous demandera de vous authentifier via votre compte Atlassian.

## Installation

Activer le plugin dans les paramètres Claude Code :

```json
{
  "enabledPlugins": {
    "release-note@angelo-plugins": true
  }
}
```

## Utilisation

### Commande

```
/release-note [équipe|projets]
```

### Exemples

```bash
# Pour une équipe
/release-note team-alpha

# Pour des projets spécifiques
/release-note PROJ FEAT

# Sans paramètre (demande interactive)
/release-note
```

## Équipes configurées

| Équipe | Projets | Description |
|--------|---------|-------------|
| team-alpha | PROJ, FEAT | Équipe Alpha |
| team-beta | BUG | Équipe Beta |

> **Note** : Adapter ce tableau à vos équipes et projets Jira.

## Format de sortie

Le skill génère une release note au format Markdown, groupée par projet et catégorie :

```markdown
# Release Note - Sprint 42

## PROJ (Project Alpha)

### Features
- [PROJ-1234] Nouvelle fonctionnalité

### Fixes
- [PROJ-1240] Correction de bug

## FEAT (Features)

### Features
- [FEAT-456] API de synchronisation
```

## Dépannage

### "MCP Atlassian non connecté"

1. Vérifier que le fichier `.mcp.json` est bien configuré
2. Relancer Claude Code pour charger la configuration MCP
3. S'authentifier si demandé

### "Aucun sprint actif trouvé"

Le skill recherche les sprints ouverts. Si aucun sprint n'est actif, il proposera de chercher le dernier sprint fermé.
