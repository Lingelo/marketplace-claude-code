# Figma

Plugin Claude Code pour le serveur MCP Figma.

## Installation

```bash
/plugin install figma@angelo-plugins
```

## Fonctionnalites

Ce plugin installe le serveur MCP officiel de Figma qui permet a Claude de :

- Lire les designs Figma (frames, composants, styles)
- Extraire les specs de design (couleurs, typographies, espacements)
- Naviguer dans les fichiers et projets Figma
- Generer du code a partir des designs

## Configuration

Le MCP Figma utilise une connexion HTTP vers `https://mcp.figma.com/mcp`.

L'authentification se fait via le navigateur lors de la premiere utilisation.

## Utilisation

Une fois le plugin installe, Claude peut acceder aux outils Figma :

```
Peux-tu analyser le design de la page d'accueil dans mon fichier Figma ?
```

## Ressources

- [Documentation MCP Figma](https://www.figma.com/developers/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
