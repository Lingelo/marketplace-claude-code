---
date: 2026-03-30
topic: claude-factory
---

# Claude Factory — Meta-plugin de creation d'outils Claude Code

## Problem Frame

Creer des outils Claude Code (skills, hooks, agents, rules, commandes) demande de connaitre les schemas de frontmatter, les conventions de nommage, les events hooks, les exit codes, et la structure de fichiers attendue. Cette connaissance est dispersee dans la doc officielle Anthropic et evolue avec chaque version. Un dev qui veut creer un skill ou un hook doit naviguer entre plusieurs pages de docs, copier des exemples, et adapter manuellement.

**Qui est affecte :** Tout utilisateur de Claude Code qui veut etendre ses capacites (plugins marketplace ou configuration projet locale).

**Pourquoi ca compte :** Reduire la friction entre "j'ai une idee d'outil" et "l'outil fonctionne" — tout en garantissant la conformite avec les specs officielles.

## Requirements

### R0. Interaction hybride (transversal a tous les skills R1-R6)
- Chaque skill accepte une description en langage naturel comme point de depart
- Apres analyse de la description, le skill pose des questions ciblees via `AskUserQuestion` UNIQUEMENT pour les decisions non resolues par la description
- Si la description est suffisamment precise, aucune question n'est posee
- Chaque skill supporte la **mise a jour** : si l'artefact cible existe deja, le skill lit l'existant, montre les differences, et propose des modifications interactives via `AskUserQuestion`

### R1. Scaffold de skills (`/factory:skill`)
- Accepte une description en langage naturel de ce que le skill doit faire
- Genere la structure complete : repertoire, SKILL.md avec frontmatter valide, fichiers support si necessaire
- Determine automatiquement les champs frontmatter pertinents (`allowed-tools`, `model`, `effort`, `context`, `paths`, `shell`, `hooks` inline, etc.) a partir de la description
- Pose des questions interactives si des decisions cles restent ambigues (ex: "Quel model ? sonnet/opus/haiku", "Faut-il un context: fork ?")
- Genere le corps du SKILL.md avec des instructions actionables, pas du placeholder
- **Mode update** : si le skill existe, lit le SKILL.md existant et propose des modifications (ajout de champs, mise a jour du body, etc.)

### R2. Scaffold de hooks (`/factory:hook`)
- Accepte une description du comportement souhaite (ex: "bloquer les rm -rf", "notifier sur Slack quand un test fail")
- Genere le `hooks.json` avec le bon event, matcher, type de hook (`command`/`http`/`prompt`/`agent`)
- Pose des questions interactives si l'event ou le type de hook est ambigu
- Genere le script d'implementation si type `command` (Node.js ou Bash)
- Respecte les conventions : exit code 0/2, JSON stdin/stdout, timeout raisonnable
- **Mode update** : si `hooks.json` existe, lit l'existant et propose d'ajouter/modifier un hook

### R3. Scaffold d'agents (`/factory:agent`)
- Accepte une description du role de l'agent
- Genere le fichier `.md` avec frontmatter complet (`name`, `description`, `tools`/`disallowedTools`, `model`, `maxTurns`, `effort`, `isolation`, `skills`, `hooks` inline)
- Pose des questions interactives sur le model, les tools, et les contraintes si ambigu
- Genere un system prompt de qualite adapte au role decrit
- **Mode update** : si l'agent existe, lit et propose des modifications (system prompt, frontmatter)

### R4. Scaffold de commandes (`/factory:command`)
- Accepte une description de la commande
- Genere le fichier `.md` avec frontmatter et contenu
- Detecte si une commande serait mieux servie en tant que skill (structure plus riche) et le suggere via question interactive
- **Mode update** : si la commande existe, lit et propose des modifications

### R5. Scaffold de rules (`/factory:rule`)
- Accepte une description de la regle
- Genere le fichier `.md` dans `.claude/rules/` avec frontmatter `paths` si pertinent
- Pose une question interactive pour determiner si la regle doit etre unconditional ou path-scoped, avec suggestion basee sur l'analyse
- **Mode update** : si la rule existe, lit et propose des modifications

### R6. Scaffold de plugin complet (`/factory:plugin`)
- Accepte une description du plugin
- Pose des questions interactives sur les composants a inclure (skills, hooks, agents, MCP, templates)
- Genere la structure complete : `plugin.json`, README.md, et les sous-composants identifies
- Propose l'enregistrement dans le `marketplace.json` si dans le contexte du marketplace
- **Mode update** : si le plugin existe, lit la structure et propose d'ajouter des composants

### R7. Maintenance CLAUDE.md (`/factory:claude-md`)
- Analyse un CLAUDE.md existant
- Identifie : sections manquantes, redondances, instructions trop longues (>200 lignes), contradictions, imports manquants
- Propose une restructuration selon les best practices officielles (headers, bullets, specifique et verifiable)
- Peut generer un CLAUDE.md from scratch si inexistant (mieux que `/init`)

### R8. Audit et validation (`/factory:audit`)
- Prend un chemin vers un plugin, skill, hook, ou agent existant
- Verifie la conformite vs les schemas officiels (frontmatter obligatoire, events valides, exit codes, etc.)
- Identifie les champs deprecies ou les patterns obsoletes
- Genere un rapport avec corrections suggerees

### R9. Documentation de reference integree (`/factory:docs`)
- Donne acces rapide aux references officielles sans quitter le terminal
- Couvre : frontmatter fields (skills, agents), hook events complets, exit codes, permission rules syntax, settings schema, string substitutions
- Accepte des queries en langage naturel (ex: `/factory:docs hook events qui peuvent bloquer`)

### R10. Documentation statique embarquee
- Toute la reference officielle est compilee dans des fichiers `.md` inclus dans le plugin
- Fonctionne offline, sans dependance reseau
- Organisee par domaine (skills, hooks, agents, rules, settings, CLAUDE.md)

## Success Criteria

- Un utilisateur peut creer un skill fonctionnel en une seule commande `/factory:skill` + description, avec des questions interactives si des decisions restent ambigues
- Un utilisateur peut mettre a jour un artefact existant via le meme skill (detection automatique du mode create/update)
- Les artefacts generes passent un audit `/factory:audit` sans erreur
- La reference docs couvre 100% des champs frontmatter et events hooks officiels (mars 2026)
- Le plugin fonctionne entierement offline (pas de dependance MCP/reseau)

## Scope Boundaries

- **Non-goal :** Generation de code metier (logique applicative) — le plugin genere de la structure et des instructions, pas du code fonctionnel
- **Non-goal :** Gestion de versions ou migration de plugins existants vers de nouveaux schemas
- **Non-goal :** Integration avec des registres externes de plugins (npm, GitHub marketplace)
- **Non-goal :** UI graphique ou web — tout est CLI/terminal via Claude Code
- **Non-goal :** Fetch dynamique de documentation (context7, web) — tout est embarque statique

## Key Decisions

- **Standalone** : Aucune dependance a `compound-engineering` ou autre plugin du marketplace. Peut coexister avec `create-agent-skills`.
- **Hybride interactif** : L'utilisateur donne une description libre, puis le skill pose des questions ciblees via `AskUserQuestion` uniquement pour les decisions non resolues. Pas de wizard complet, mais un accompagnement intelligent.
- **Creation + update** : Chaque skill detecte si l'artefact existe. Si oui, mode update interactif (lecture de l'existant, proposition de modifications). Si non, mode creation.
- **Doc embarquee statique** : La reference officielle est compilee dans le plugin. Avantage : offline, predictible. Trade-off : necessite des mises a jour manuelles quand Anthropic change les specs.
- **Nom : `claude-factory`** : Invocation via `/factory:skill`, `/factory:hook`, etc.

## Dependencies / Assumptions

- Les schemas officiels Claude Code (frontmatter, hooks, settings) sont stables a la date de mars 2026. Le plugin devra etre mis a jour si Anthropic fait des breaking changes.
- Le plugin cible le marketplace existant (`marketplace-claude-code`) mais les outils generes fonctionnent aussi en standalone (`.claude/skills/`, `.claude/rules/`, etc.)

## Outstanding Questions

### Resolve Before Planning
_(aucune — toutes les decisions produit sont resolues)_

### Deferred to Planning
- [Affects R10][Needs research] Quelle granularite pour les fichiers de reference embarques ? Un fichier par domaine ou un fichier par concept (ex: `hook-events.md`, `skill-frontmatter.md`) ?
- [Affects R1-R6][Technical] Faut-il un agent dedie (`context: fork`) pour chaque sous-skill ou un seul skill principal qui dispatch ?
- [Affects R8][Technical] Comment structurer les regles de validation pour l'audit ? Schema JSON, checks programmatiques (script), ou instructions LLM ?
- [Affects R1-R6][Technical] Structure du plugin : un skill par sous-commande (`skills/factory-skill/`, `skills/factory-hook/`, etc.) ou un skill unique avec dispatch interne ?

## Next Steps

-> `/ce:plan` pour la planification structuree de l'implementation
