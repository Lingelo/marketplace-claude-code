---
name: release-note
description: Génère une release note des tickets Jira terminés du sprint courant via MCP Atlassian. Utiliser quand l'utilisateur demande de faire une release note, /release-note, ou veut générer un changelog depuis Jira.
---

# Release Note Generator

Génère une release note compacte des tickets Jira terminés (status Done) pour le sprint courant, groupés par projet.

## Prérequis

Le serveur MCP Atlassian doit être configuré et connecté. Vérifier la disponibilité des outils Jira avant de commencer.

## Paramètres

L'utilisateur peut spécifier :
- **Équipe(s)** : nom de l'équipe pour filtrer le sprint (ex: "team-alpha", "team-beta")
- **Projet(s)** : code(s) projet Jira à inclure (ex: "PROJ", "FEAT", "BUG")

Si aucun paramètre n'est fourni, demander à l'utilisateur de préciser l'équipe ou les projets.

## Équipes connues

| Équipe | Projets associés | Board/Sprint |
|--------|------------------|--------------|
| team-alpha | PROJ, FEAT | Team Alpha Sprint |
| team-beta | BUG | Team Beta Sprint |

> **Note** : Adapter ce tableau à vos équipes et projets Jira.

## Instructions

### 1. Identifier les paramètres

Analyser la demande de l'utilisateur pour extraire :
- Le nom de l'équipe (pour trouver le sprint actif)
- Les codes projets à inclure

Si non spécifié, demander :
```
Pour quelle équipe/projets souhaitez-vous générer la release note ?
- Équipe : team-alpha, team-beta, autre ?
- Projets : PROJ, FEAT, BUG, autre ?
```

### 2. Récupérer le sprint actif

Utiliser l'outil MCP Atlassian `jira_get_sprints` ou rechercher via JQL :

```jql
project IN (<PROJETS>) AND sprint IN openSprints()
```

Identifier le nom et l'ID du sprint actif.

### 3. Récupérer les tickets Done

Utiliser l'outil MCP Atlassian `jira_search` avec le JQL :

```jql
project IN (<PROJETS>) AND sprint = <SPRINT_ID> AND status = Done ORDER BY project ASC, issuetype ASC
```

Récupérer pour chaque ticket :
- Clé (ex: MOJ-123)
- Résumé (titre)
- Type (Story, Bug, Task, etc.)
- Projet

### 4. Classifier par type

Mapper les types Jira vers les catégories de release note :

| Type Jira | Catégorie | Emoji |
|-----------|-----------|-------|
| Story, Improvement | Features | :rocket: |
| Bug | Fixes | :wrench: |
| Task, Sub-task | Chores | :gear: |
| Spike, Research | Technical | :microscope: |

### 5. Générer la release note

Format compact groupé par projet, puis par catégorie :

```markdown
# Release Note - <Nom du Sprint>

## <PROJET> (<Nom Projet>)

### Features
- [<PROJET>-123] Titre de la story
- [<PROJET>-124] Autre feature

### Fixes
- [<PROJET>-125] Correction du bug

### Chores
- [<PROJET>-126] Tâche technique
```

## Format de sortie

### Compact (par défaut)

```markdown
# Release Note - Sprint 42

## PROJ (Project Alpha)

### Features
- [PROJ-1234] Ajout de l'authentification OAuth2
- [PROJ-1235] Nouveau dashboard utilisateur

### Fixes
- [PROJ-1240] Correction de la pagination
- [PROJ-1241] Fix du calcul des totaux

## FEAT (Features)

### Features
- [FEAT-456] API de synchronisation

### Chores
- [FEAT-460] Mise à jour des dépendances
```

## Exemples d'utilisation

### Avec équipe
```
/release-note team-alpha
```
→ Génère la release note pour l'équipe Team Alpha (projets PROJ, FEAT)

### Avec projets spécifiques
```
/release-note PROJ FEAT
```
→ Génère la release note pour les projets PROJ et FEAT

### Sans paramètre
```
/release-note
```
→ Demande à l'utilisateur de préciser l'équipe ou les projets

## Gestion des erreurs

- **MCP Atlassian non connecté** : Informer l'utilisateur de configurer le serveur MCP
- **Aucun sprint actif** : Proposer de chercher le dernier sprint fermé
- **Aucun ticket Done** : Indiquer qu'aucun ticket n'est terminé dans le sprint

## Notes

- Les tickets sont triés par projet puis par type
- Seuls les tickets avec le status "Done" sont inclus
- Le format peut être adapté selon les besoins (demander à l'utilisateur)