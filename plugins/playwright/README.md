# Plugin Playwright

MCP Playwright integre + agents IA pour les tests end-to-end : planification, generation et reparation.

## Installation

```bash
/plugin install playwright@angelo-plugins
```

Ce plugin installe automatiquement :
- Le serveur MCP Playwright (`@playwright/mcp`)
- Les agents specialises (planner, generator, healer)

## Agents

### Planner (Vert)

Crée des plans de tests complets en explorant les applications web.

**Utiliser quand :** Vous avez besoin de scénarios de test pour une page ou application web.

```
"J'ai besoin de scénarios de test pour notre checkout sur https://mystore.com/checkout"
```

**Capacités :**
- Naviguer et explorer les interfaces web
- Cartographier les parcours utilisateur et chemins critiques
- Concevoir des scénarios de test (happy path, edge cases, gestion d'erreurs)
- Générer une documentation de plan de test structurée

### Generator (Bleu)

Crée du code de test Playwright robuste et fiable.

**Utiliser quand :** Vous avez un plan de test et avez besoin de l'implémentation.

**Capacités :**
- Générer des fichiers de test Playwright
- Simuler des interactions utilisateur réelles
- Ajouter des assertions et validations appropriées
- Suivre les bonnes pratiques de test

### Healer (Rouge)

Débogue et corrige les tests Playwright en échec.

**Utiliser quand :** Des tests échouent et nécessitent un diagnostic/réparation.

**Capacités :**
- Analyser les échecs de tests
- Identifier les causes racines (sélecteurs, timing, logique)
- Appliquer des corrections systématiquement
- Vérifier que les réparations fonctionnent

## Serveur MCP inclus

Le serveur MCP Playwright est automatiquement configure lors de l'installation du plugin.

Configuration incluse (`.mcp.json`) :
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

## Structure

```
playwright/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json              # Configuration MCP Playwright
├── agents/
│   ├── playwright-test-planner.md
│   ├── playwright-test-generator.md
│   └── playwright-test-healer.md
└── README.md
```
