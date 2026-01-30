# Plugin Workflows

Workflow d'implémentation systématique utilisant la méthodologie **Explore-Plan-Code-Test**.

## EPCT vs Plan Mode natif

Claude Code intègre un **Plan Mode natif** (activé avec `Shift+Tab` ou `--permission-mode plan`) qui partage la même philosophie Explore → Plan → Code [recommandée par Anthropic](https://www.anthropic.com/engineering/claude-code-best-practices).

### Comparaison

| Aspect | Plan Mode natif | EPCT |
|--------|-----------------|------|
| **Activation** | `Shift+Tab` (2x) | `/epct` |
| **Phases** | Explore → Plan → Code | Explore → Plan → Code → **Test** |
| **Mode** | Read-only jusqu'à approbation | Workflow guidé complet |
| **Subagents** | Non | Oui (exploration parallèle) |
| **Validation tests** | Manuelle | Automatique (lint, typecheck, tests) |
| **Itération** | Manuelle | Automatique (si test fail → retour Plan) |
| **Thinking** | Standard | Force "ULTRA THINK" |

### Quand utiliser quoi ?

**Utilisez le Plan Mode natif (`Shift+Tab`) pour :**
- Exploration rapide d'un codebase inconnu
- Planification d'un refactoring avec validation manuelle
- Tâches simples où vous voulez garder le contrôle total

**Utilisez EPCT (`/epct`) pour :**
- Implémentations complètes avec tests automatisés
- Features complexes nécessitant exploration parallèle
- Workflow structuré avec cycle itératif (test → fix → retest)
- Intégration Jira (`/epct-jira`)

> **Astuce** : Vous pouvez combiner les deux ! Utilisez Plan Mode pour l'exploration initiale, puis `/epct` pour l'implémentation structurée.

## Installation

```bash
/plugin install workflows@angelo-plugins
```

## Utilisation

### Version Standard
```bash
/epct
```

### Version avec Jira
```bash
/epct-jira PROJ-123
# ou sans argument (demandera le numéro)
/epct-jira
```

Récupère le contexte du ticket Jira via MCP Atlassian avant de lancer le workflow EPCT. Nécessite la configuration MCP Atlassian.

**Fonctionnalité plan.md** : Cette version génère automatiquement un `plan.md` structuré à la racine du projet :
- Créé en phase PLAN avec toutes les décisions et la stratégie
- Mis à jour en phase CODE avec les découvertes et l'avancement
- Finalisé en phase TEST avec les résultats et la checklist
- Source de vérité pour tout le workflow d'implémentation

## Phases du workflow

### 1. Explore

Trouver tous les fichiers pertinents pour l'implémentation :
- Lancer des sous-agents en parallèle pour explorer le codebase
- Collecter des informations en ligne via recherche web
- Trouver des fichiers exemples et cibles d'édition

### 2. Plan

Créer une stratégie d'implémentation détaillée :
- Changements de fonctionnalités principales
- Besoins en couverture de tests
- Mises à jour de documentation
- **S'arrêter et demander** si quelque chose n'est pas clair

### 3. Code

Implémenter en suivant les patterns existants :
- Respecter le style et les conventions du codebase
- Rester strictement dans le scope
- Lancer l'autoformatage une fois terminé
- Corriger les warnings du linter

### 4. Test

Vérifier que les changements fonctionnent :
- Vérifier `package.json` pour les scripts disponibles
- Lancer `lint`, `typecheck`, `test`
- Tester uniquement ce qui a été modifié
- Si les tests échouent : retourner à la phase Plan

## Priorité

**Correction > Complétude > Rapidité**

Chaque phase doit être complète avant de passer à la suivante.

## Composants

| Type | Nom | Description |
|------|-----|-------------|
| Command | `/epct` | Commande principale du workflow |
| Command | `/epct-jira` | Workflow avec contexte Jira |
| Agent | `explore-codebase` | Spécialiste d'exploration de codebase |

## Structure du plan.md

Le fichier `plan.md` généré contient 12 sections :

1. **Contexte & Objectif** - Description de la feature, valeur business
2. **Questions & Décisions** - Historique des choix avec justifications
3. **Todo Liste** - Par phase (PLAN/CODE/TEST) avec checkboxes
4. **Fichiers Impactés** - À modifier/créer/supprimer
5. **Risques & Points d'Attention** - Breaking changes, CLAUDE.md
6. **Tests Requis** - Unit/Integration/Edge cases
7. **Patterns & Conventions** - Découverts en phase Explore
8. **Dépendances** - npm packages à ajouter/updater
9. **Documentation** - README, CLAUDE.md, wiki
10. **Déploiement** - Migrations, config, ordre
11. **Notes de l'Agent** - Découvertes pendant CODE/TEST
12. **Checklist Finale** - Validation avant commit/PR

Le template complet est disponible dans `.templates/plan.md`.

## Structure du Plugin

```
workflows/
├── .claude-plugin/
│   └── plugin.json
├── .templates/
│   └── plan.md              # Template pour plan.md
├── commands/
│   ├── epct.md              # Standard workflow
│   └── epct-jira.md         # Workflow avec contexte Jira
└── agents/
    └── explore-codebase.md  # Exploration de codebase
```
