---
name: push
description: Pousse les commits vers le remote avec un verrou de securite qui bloque les push vers origin/main et origin/master. Utiliser quand l'utilisateur demande de faire un push, /push, ou veut pousser ses changements.
---

# Push Securise

Pousse les commits vers le remote avec un verrou de securite qui empeche les push directs vers les branches protegees (main/master).

## Verrou de Securite

**IMPORTANT : Ce skill REFUSE systematiquement de pousser vers :**
- `origin/main`
- `origin/master`

Ce verrou est une mesure de securite pour eviter les push accidentels sur les branches principales.

## Instructions

### 1. Verifier la branche courante

```bash
git branch --show-current
```

### 2. Verifier le statut

```bash
git status
```

Verifier :
- S'il y a des commits a pousser
- Si la branche track un remote
- L'etat de la branche par rapport au remote

### 3. Appliquer le verrou de securite

**AVANT tout push, verifier la branche cible :**

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || echo "no-upstream"
```

**BLOQUER le push si la branche courante est `main` ou `master` :**

Si la branche courante est `main` ou `master` :
1. **NE PAS executer le push**
2. Afficher un message d'erreur clair
3. Suggerer de creer une branche de feature

**Message a afficher :**
```
ERREUR : Push vers origin/main ou origin/master bloque

Le push direct vers les branches principales est interdit pour des raisons de securite.

Pour pousser vos changements :
1. Creez une branche de feature : git checkout -b feature/ma-feature
2. Poussez sur cette branche : git push -u origin feature/ma-feature
3. Creez une Merge Request / Pull Request
```

### 4. Executer le push (si autorise)

Si la branche n'est PAS `main` ou `master` :

**Premier push (nouvelle branche) :**
```bash
git push -u origin <branch-name>
```

**Push subsequent :**
```bash
git push
```

**Push avec tags :**
```bash
git push --follow-tags
```

## Workflow complet

1. Obtenir le nom de la branche courante
2. **VERIFIER que ce n'est PAS `main` ou `master`**
3. Si `main` ou `master` → BLOQUER et afficher le message d'erreur
4. Sinon → executer le push normalement
5. Confirmer le succes du push

## Exemples

### Push autorise

```
Branche : feature/MOJ-1234-add-login
→ Push autorise vers origin/feature/MOJ-1234-add-login
```

```
Branche : fix/UNIV-456-bugfix
→ Push autorise vers origin/fix/UNIV-456-bugfix
```

### Push bloque

```
Branche : main
→ BLOQUE - Afficher message d'erreur
```

```
Branche : master
→ BLOQUE - Afficher message d'erreur
```

## Options supportees

| Option | Description |
|--------|-------------|
| `--force` | Force push (utiliser avec precaution) |
| `--force-with-lease` | Force push securise |
| `--tags` | Pousse aussi les tags |
| `--follow-tags` | Pousse les tags annotes |
| `-u` / `--set-upstream` | Configure le tracking de la branche |

## Notes importantes

- Le verrou sur main/master est **NON NEGOCIABLE**
- Si l'utilisateur insiste pour pousser sur main/master, **REFUSER** et expliquer pourquoi
- Suggerer toujours le workflow via Merge Request / Pull Request
- Ce verrou protege contre les erreurs humaines, pas contre les intentions malveillantes
