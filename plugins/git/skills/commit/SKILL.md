---
name: commit
description: Crée des commits en format conventional commits avec extraction automatique du numéro Jira de la branche. Utiliser quand l'utilisateur demande de faire un commit, /commit, ou veut commiter ses changements.
---

# Commit Conventionnel avec Jira

Crée des commits respectant la spécification [Conventional Commits](https://www.conventionalcommits.org/) avec extraction automatique du numéro de ticket Jira depuis la branche courante.

## Format du commit

```
<type>(<jira>): <description>

[corps optionnel]

[footer optionnel]
```

**Si aucun numéro Jira n'est trouvé dans la branche :**

```
<type>: <description>
```

## Instructions

### 1. Extraire le numéro Jira de la branche

```bash
git branch --show-current
```

Chercher un pattern de ticket Jira dans le nom de la branche :
- Patterns courants : `MOJ-1234`, `UNIV-456`, `ABC-789`
- Regex : `[A-Z]+-[0-9]+`
- Exemples de branches :
  - `feature/MOJ-1234-add-login` → `MOJ-1234`
  - `fix/UNIV-456-fix-bug` → `UNIV-456`
  - `MOJ-789-refactor` → `MOJ-789`
  - `main` → pas de Jira

### 2. Analyser les changements

```bash
git status
git diff --staged
git diff
```

Comprendre :
- Quels fichiers sont modifiés
- La nature des changements (nouvelle fonctionnalité, correction, refactoring...)
- L'intention de l'utilisateur

### 3. Déterminer le type de commit

| Type | Description | Quand l'utiliser |
|------|-------------|------------------|
| `feat` | Nouvelle fonctionnalité | Ajout d'une nouvelle feature pour l'utilisateur |
| `fix` | Correction de bug | Correction d'un bug |
| `docs` | Documentation | Changements de documentation uniquement |
| `style` | Style de code | Formatage, point-virgules, pas de changement de logique |
| `refactor` | Refactoring | Restructuration du code sans changer le comportement |
| `perf` | Performance | Amélioration des performances |
| `test` | Tests | Ajout ou correction de tests |
| `build` | Build | Changements du système de build ou dépendances |
| `ci` | CI/CD | Changements de configuration CI/CD |
| `chore` | Maintenance | Tâches de maintenance, mise à jour de dépendances |

### 4. Rédiger la description

- En français ou anglais selon le projet
- Commencer par un verbe à l'impératif : "ajoute", "corrige", "met à jour"
- Maximum 72 caractères
- Pas de point final
- Décrire le "quoi" et le "pourquoi", pas le "comment"

### 5. Créer le commit

**Avec Jira :**
```bash
git add <fichiers>
git commit -m "<type>(<JIRA-123>): <description>"
```

**Sans Jira :**
```bash
git add <fichiers>
git commit -m "<type>: <description>"
```

## Exemples

### Avec numéro Jira

Branche : `feature/MOJ-1234-user-authentication`

```bash
git commit -m "feat(MOJ-1234): ajoute l'authentification OAuth2"
```

```bash
git commit -m "fix(UNIV-456): corrige la validation des formulaires"
```

```bash
git commit -m "refactor(MOJ-789): simplifie la logique de calcul"
```

### Sans numéro Jira

Branche : `main` ou `develop`

```bash
git commit -m "chore: met à jour les dépendances"
```

```bash
git commit -m "docs: améliore le README"
```

### Avec corps détaillé

```bash
git commit -m "feat(MOJ-1234): ajoute la pagination des résultats

Implémente la pagination côté serveur pour améliorer
les performances sur les grandes listes.

- Ajoute les paramètres page et limit
- Retourne le total dans les headers
- Met à jour les tests d'intégration"
```

## Breaking Changes

Pour les changements cassants, ajouter un point d'exclamation (!) après le type ou le scope :

```bash
git commit -m "feat(MOJ-1234)!: change le format de l'API de réponse"
```

Ou dans le footer :

```bash
git commit -m "feat(MOJ-1234): refonte de l'API utilisateurs

BREAKING CHANGE: le format de réponse a changé de array à objet paginé"
```

## Workflow complet

1. Vérifier la branche : `git branch --show-current`
2. Extraire le Jira (si présent)
3. Vérifier les changements : `git status` et `git diff`
4. Stager les fichiers pertinents : `git add <fichiers>`
5. Demander l'intention à l'utilisateur si pas claire
6. Créer le commit avec le bon format

## Notes importantes

- Ne jamais mentionner d'outils IA dans les messages de commit
- Un commit = une modification logique cohérente
- Préférer plusieurs petits commits à un gros commit
- Vérifier que le code compile/lint avant de commiter
