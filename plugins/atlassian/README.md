# Atlassian

Plugin Claude Code pour le serveur MCP Atlassian (Jira + Confluence).

## Installation

```bash
/plugin install atlassian@angelo-plugins
```

## Fonctionnalites

Ce plugin installe le serveur MCP officiel d'Atlassian qui permet a Claude de :

### Jira
- Lire et rechercher des tickets Jira
- Creer et mettre a jour des tickets
- Gerer les sprints et backlogs
- Extraire les informations de release

### Confluence
- Lire les pages Confluence
- Rechercher dans la documentation
- Creer et mettre a jour des pages

## Configuration

Le MCP Atlassian utilise une connexion SSE via `mcp-remote` vers `https://mcp.atlassian.com/v1/sse`.

L'authentification se fait via OAuth lors de la premiere utilisation.

## Utilisation

Une fois le plugin installe, Claude peut acceder aux outils Atlassian :

```
Quels sont les tickets du sprint courant sur le projet MYPROJECT ?
```

```
Genere une release note des tickets termines cette semaine.
```

## Ressources

- [Documentation MCP Atlassian](https://developer.atlassian.com/cloud/mcp/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
