# Git Plugin

Utilitaires Git pour Claude Code : conventional commits avec extraction Jira et push securise.

## Fonctionnalites

- **Commit** : Commits conventionnels avec extraction automatique du numero Jira depuis la branche
- **Push** : Push securise avec verrou sur les branches principales (main/master)

## Installation

Activer le plugin dans les parametres Claude Code :

```json
{
  "enabledPlugins": {
    "git@angelo-plugins": true
  }
}
```

## Skills

### /commit

Cree des commits respectant la specification [Conventional Commits](https://www.conventionalcommits.org/) avec extraction automatique du ticket Jira.

```bash
/commit
```

**Format :**
```
<type>(<JIRA-123>): <description>
```

**Types supportes :**
| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalite |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage |
| `refactor` | Refactoring |
| `perf` | Performance |
| `test` | Tests |
| `build` | Build |
| `ci` | CI/CD |
| `chore` | Maintenance |

**Exemples :**
```bash
# Branche : feature/MOJ-1234-add-login
git commit -m "feat(MOJ-1234): ajoute l'authentification OAuth2"

# Branche : main (pas de Jira)
git commit -m "chore: met a jour les dependances"
```

### /push

Pousse les commits vers le remote avec un verrou de securite.

```bash
/push
```

**Verrou de securite :**

Ce skill **REFUSE** de pousser vers :
- `origin/main`
- `origin/master`

**Comportement :**
- Sur une branche de feature → Push normal
- Sur main/master → Bloque avec message d'erreur

**Message en cas de blocage :**
```
ERREUR : Push vers origin/main ou origin/master bloque

Le push direct vers les branches principales est interdit.

Pour pousser vos changements :
1. Creez une branche : git checkout -b feature/ma-feature
2. Poussez : git push -u origin feature/ma-feature
3. Creez une Merge Request
```

## Workflow recommande

1. Creer une branche depuis main :
   ```bash
   git checkout -b feature/MOJ-1234-ma-feature origin/main
   ```

2. Faire des modifications et commiter :
   ```
   /commit
   ```

3. Pousser la branche :
   ```
   /push
   ```

4. Creer une Merge Request sur GitLab/GitHub

## Pourquoi ce verrou ?

Le verrou sur main/master est une mesure de securite pour :
- Eviter les push accidentels sur les branches protegees
- Forcer le workflow via Merge Request / Pull Request
- Permettre la revue de code avant integration
- Proteger l'historique des branches principales
