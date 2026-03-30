---
title: "feat: Claude Factory meta-plugin for Claude Code tooling"
type: feat
status: active
date: 2026-03-30
origin: docs/brainstorms/2026-03-30-claude-factory-requirements.md
---

# feat: Claude Factory — Meta-plugin de creation d'outils Claude Code

## Overview

Plugin standalone pour le marketplace `marketplace-claude-code` qui permet de creer tout type d'outil Claude Code (skills, hooks, agents, commandes, rules), maintenir les fichiers CLAUDE.md, auditer des artefacts existants, et consulter la documentation officielle — le tout offline avec de la documentation statique embarquee.

## Problem Statement / Motivation

Creer des outils Claude Code demande de connaitre les schemas frontmatter, les conventions de nommage, les events hooks, les exit codes, et la structure de fichiers. Cette connaissance est dispersee et evolue. Le plugin reduit la friction entre "j'ai une idee" et "l'outil fonctionne" tout en garantissant la conformite avec les specs officielles de mars 2026. (see origin: `docs/brainstorms/2026-03-30-claude-factory-requirements.md`)

## Proposed Solution

Un plugin `claude-factory` avec **9 skills independants** partageant une base de **reference docs statique embarquee**. Chaque skill prend une description en langage naturel et genere les artefacts correspondants.

### Architecture du plugin

```
plugins/claude-factory/
  .claude-plugin/plugin.json
  README.md
  references/                          # R10 — Documentation officielle embarquee
    skill-spec.md                      # Frontmatter complet, string substitutions, best practices
    hook-spec.md                       # Events complets (25+), types, exit codes, JSON output
    agent-spec.md                      # Frontmatter, contraintes, invocation methods
    command-spec.md                    # Format, relation avec skills
    rule-spec.md                       # Path-scoping, glob patterns, precedence
    settings-spec.md                   # settings.json schema, permission rules syntax
    claude-md-spec.md                  # Structure, imports, limites, best practices
    plugin-spec.md                     # plugin.json schema, marketplace registration
  templates/                           # Templates de generation
    skill-simple.md                    # Template SKILL.md basique
    skill-router.md                    # Template SKILL.md router (multi-workflow)
    hook-command.json                  # Template hooks.json type command
    hook-script.js                     # Template script Node.js pour hook
    hook-script.sh                     # Template script Bash pour hook
    agent.md                           # Template agent .md
    command.md                         # Template command .md
    rule-global.md                     # Template rule sans path-scoping
    rule-scoped.md                     # Template rule avec paths frontmatter
    plugin.json                        # Template plugin.json
    readme.md                          # Template README.md pour plugin
  skills/
    skill/SKILL.md                     # R1 — /factory:skill
    hook/SKILL.md                      # R2 — /factory:hook
    agent/SKILL.md                     # R3 — /factory:agent
    command/SKILL.md                   # R4 — /factory:command
    rule/SKILL.md                      # R5 — /factory:rule
    plugin/SKILL.md                    # R6 — /factory:plugin
    claude-md/SKILL.md                 # R7 — /factory:claude-md
    audit/SKILL.md                     # R8 — /factory:audit
    docs/SKILL.md                      # R9 — /factory:docs
```

### Decisions techniques (issues resolues du SpecFlow)

**Target path resolution (Q1)** : Inference depuis CWD.
- Si CWD est dans `plugins/<name>/` → ecriture dans ce plugin
- Si CWD contient `.claude-plugin/marketplace.json` → proposer quel plugin cibler
- Sinon → ecriture dans `.claude/skills/`, `.claude/rules/`, `.claude/agents/` (standalone)
- L'utilisateur peut passer un chemin explicite en argument : `/factory:skill path/to/target "description"`

**Naming (Q3)** : LLM-infere depuis la description, kebab-case. L'utilisateur peut overrider en prefixant : `/factory:skill my-name "description"`.

**Collision (Q2)** : Si un artefact existe deja au chemin cible, le skill affiche une erreur claire avec le chemin existant et suggere un nom alternatif. Pas d'ecrasement implicite.

**Incremental additions (Q5)** : `/factory:hook` dans un plugin existant detecte le `hooks.json` existant et **append** un nouveau hook entry au tableau. Idem pour `marketplace.json` registration.

**Plugin context (Q4)** : Detection par presence de `marketplace.json` ou `.claude-plugin/plugin.json` dans les parents de CWD.

**CLAUDE.md scope (Q6)** : Cible le CLAUDE.md le plus proche de CWD. Si aucun, propose de le creer a la racine du projet.

**Audit type detection (Q7)** : Convention-based — `SKILL.md` = skill, `hooks.json` = hook, `agents/*.md` = agent, etc. Si ambigu, demande.

**Language (Q8)** : Le contenu genere suit la langue de la description de l'utilisateur. Les champs frontmatter techniques restent en anglais.

**Dry-run (Q9)** : Pas en v1. Chaque skill affiche un resume de ce qui sera cree AVANT d'ecrire (sans bloquer).

**Self-audit (Q10)** : Pas automatique. Le skill mentionne `/factory:audit` comme etape recommandee apres generation.

## Technical Considerations

### Shared references pattern

Chaque skill SKILL.md reference les docs pertinentes via des imports relatifs. Exemple pour `skills/skill/SKILL.md` :

```markdown
---
name: skill
description: Scaffold a Claude Code skill from natural language description. Use when creating /commands, SKILL.md files, or extending Claude Code capabilities.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
---

# Factory: Create Skill

Reference: @../../references/skill-spec.md
Templates: @../../templates/skill-simple.md, @../../templates/skill-router.md

[Instructions for generation...]
```

Cela permet a chaque skill de ne charger que les references pertinentes sans dupliquer le contenu.

### Reference docs : contenu a compiler

Chaque fichier de reference est une **compilation structuree** de la documentation officielle Anthropic (mars 2026), organisee pour la consultation rapide par le LLM :

| Fichier | Contenu cle |
|---------|-------------|
| `skill-spec.md` | 20+ champs frontmatter, string substitutions ($ARGUMENTS, ${CLAUDE_SKILL_DIR}), dynamic context (!`cmd`), best practices |
| `hook-spec.md` | 25+ events (PreToolUse → SessionEnd), 4 types (command/http/prompt/agent), exit codes, JSON output schema, env vars |
| `agent-spec.md` | Frontmatter complet (15+ champs), built-in agents, contraintes (no nesting), invocation methods |
| `command-spec.md` | Format, merge avec skills, precedence |
| `rule-spec.md` | paths frontmatter, glob syntax, unconditional vs scoped, precedence |
| `settings-spec.md` | Permission rules (`ToolName(pattern)`), hooks config, env, model, managed settings |
| `claude-md-spec.md` | Locations, precedence, imports (@path), 200-line guideline, AGENTS.md compat |
| `plugin-spec.md` | plugin.json schema, marketplace.json format, categories |

### Pas de scripts — tout est instructions LLM

Le plugin ne contient **aucun script Node.js ou Bash** pour la generation. Les SKILL.md contiennent des instructions detaillees que Claude execute avec les outils standard (Read, Write, Glob, Grep, Bash). Les templates servent de base que le LLM adapte.

Exceptions possibles : l'audit (R8) pourrait beneficier d'un script de validation JSON schema, mais la v1 utilise uniquement des instructions LLM.

## System-Wide Impact

- **Interaction graph** : Chaque skill cree des fichiers. Le skill `/factory:plugin` peut modifier `marketplace.json`. Le skill `/factory:claude-md` modifie CLAUDE.md. Aucune interaction avec des hooks ou des services externes.
- **Error propagation** : Les erreurs sont des fichiers mal formes ou des chemins invalides. Le LLM detecte et corrige dans le flux.
- **State lifecycle risks** : Le seul risque est une generation partielle si Claude est interrompu. Les fichiers ecrits sont independants, pas de transaction multi-fichiers critique.
- **API surface parity** : Pas d'API. Tout est CLI via Claude Code skills.

## Acceptance Criteria

### R1-R5 : Scaffolds unitaires
- [ ] `/factory:skill "description"` genere `SKILL.md` avec frontmatter valide et instructions actionables
- [ ] `/factory:hook "description"` genere `hooks.json` valide + script si type command
- [ ] `/factory:agent "description"` genere agent `.md` avec frontmatter complet et system prompt
- [ ] `/factory:command "description"` genere command `.md` — suggere conversion en skill si pertinent
- [ ] `/factory:rule "description"` genere rule `.md` avec path-scoping si applicable
- [ ] Chaque scaffold detecte le contexte (marketplace plugin vs standalone) pour le chemin cible
- [ ] Collision detectee → erreur claire, pas d'ecrasement

### R6 : Plugin complet
- [ ] `/factory:plugin "description"` genere la structure complete (plugin.json, README, sous-composants)
- [ ] Propose registration dans marketplace.json si contexte marketplace detecte

### R7 : CLAUDE.md
- [ ] `/factory:claude-md` sans argument → analyse le CLAUDE.md le plus proche
- [ ] Identifie : sections manquantes, >200 lignes, contradictions, imports manquants
- [ ] Propose restructuration concrete
- [ ] Sans CLAUDE.md existant → genere from scratch base sur l'analyse du projet

### R8 : Audit
- [ ] `/factory:audit path` detecte le type d'artefact automatiquement
- [ ] Verifie la conformite vs les schemas embarques
- [ ] Rapport structure avec erreurs, warnings, suggestions

### R9 : Docs
- [ ] `/factory:docs "query"` retourne la reference pertinente depuis les docs statiques
- [ ] Couvre 100% des champs frontmatter skills, agents, et events hooks (mars 2026)

### R10 : Documentation embarquee
- [ ] 8 fichiers de reference complets et structures
- [ ] 11 templates couvrant tous les types d'artefacts
- [ ] Fonctionnement 100% offline

### Qualite globale
- [ ] Les artefacts generes passent `/factory:audit` sans erreur
- [ ] Chaque skill affiche un resume de ce qui sera cree avant d'ecrire
- [ ] Plugin enregistre dans marketplace.json, categorie "development"
- [ ] README.md complet avec exemples d'utilisation pour chaque sous-commande

## Implementation Phases

### Phase 1 : Foundation (references + templates + plugin skeleton)

**Objectif** : Creer la base de connaissances qui alimente tous les generateurs.

**Fichiers a creer** :
- `plugins/claude-factory/.claude-plugin/plugin.json`
- `plugins/claude-factory/README.md` (placeholder, complete en Phase 5)
- `plugins/claude-factory/references/skill-spec.md`
- `plugins/claude-factory/references/hook-spec.md`
- `plugins/claude-factory/references/agent-spec.md`
- `plugins/claude-factory/references/command-spec.md`
- `plugins/claude-factory/references/rule-spec.md`
- `plugins/claude-factory/references/settings-spec.md`
- `plugins/claude-factory/references/claude-md-spec.md`
- `plugins/claude-factory/references/plugin-spec.md`
- `plugins/claude-factory/templates/skill-simple.md`
- `plugins/claude-factory/templates/skill-router.md`
- `plugins/claude-factory/templates/hook-command.json`
- `plugins/claude-factory/templates/hook-script.js`
- `plugins/claude-factory/templates/hook-script.sh`
- `plugins/claude-factory/templates/agent.md`
- `plugins/claude-factory/templates/command.md`
- `plugins/claude-factory/templates/rule-global.md`
- `plugins/claude-factory/templates/rule-scoped.md`
- `plugins/claude-factory/templates/plugin.json`
- `plugins/claude-factory/templates/readme.md`

**Critere de sortie** : Les references couvrent 100% des specs officielles mars 2026. Les templates sont fonctionnels et valides.

### Phase 2 : Core generators (R1-R5)

**Objectif** : Les 5 skills de scaffolding unitaire.

**Fichiers a creer** :
- `plugins/claude-factory/skills/skill/SKILL.md`
- `plugins/claude-factory/skills/hook/SKILL.md`
- `plugins/claude-factory/skills/agent/SKILL.md`
- `plugins/claude-factory/skills/command/SKILL.md`
- `plugins/claude-factory/skills/rule/SKILL.md`

**Chaque SKILL.md suit la meme structure** :
1. Frontmatter (`name`, `description` avec triggers, `allowed-tools`)
2. Import des references pertinentes via `@../../references/`
3. Instructions de parsing de la description utilisateur
4. Logique de detection du contexte (marketplace vs standalone)
5. Logique de detection de collision
6. Instructions de generation avec le template comme base
7. Resume post-generation + suggestion `/factory:audit`

**Critere de sortie** : Chaque skill genere un artefact valide a partir d'une description en langage naturel.

### Phase 3 : Plugin scaffold (R6)

**Objectif** : Generation d'un plugin complet.

**Fichier a creer** :
- `plugins/claude-factory/skills/plugin/SKILL.md`

**Logique specifique** :
- Analyse la description pour identifier les sous-composants necessaires (skills? hooks? agents? MCP?)
- Genere la structure complete en orchestrant les templates
- Detecte le marketplace et propose l'enregistrement
- Genere un README.md adapte au plugin cree

**Critere de sortie** : `/factory:plugin "un plugin de securite qui bloque les fichiers sensibles"` genere un plugin fonctionnel avec hooks, scripts, plugin.json, et README.

### Phase 4 : Maintenance et validation (R7, R8)

**Fichiers a creer** :
- `plugins/claude-factory/skills/claude-md/SKILL.md`
- `plugins/claude-factory/skills/audit/SKILL.md`

**claude-md** : Analyse structurelle (line count, sections, imports, contradictions), comparaison vs `claude-md-spec.md`, suggestions concretes de restructuration, generation from scratch si inexistant.

**audit** : Detection du type d'artefact par convention de chemin, validation des champs obligatoires et optionnels vs les specs embarquees, rapport structure (errors/warnings/info).

**Critere de sortie** : `/factory:audit` detecte correctement les erreurs dans un artefact volontairement mal forme.

### Phase 5 : Documentation reference (R9) + finalisation

**Fichiers a creer** :
- `plugins/claude-factory/skills/docs/SKILL.md`

**Fichiers a mettre a jour** :
- `plugins/claude-factory/README.md` (version complete avec exemples)
- `.claude-plugin/marketplace.json` (ajout de l'entree claude-factory)

**docs** : Le skill lit la query utilisateur, identifie le domaine (skill, hook, agent, etc.), charge la reference pertinente depuis `references/`, et retourne un extrait cible.

**Critere de sortie** : `/factory:docs "quels events hooks peuvent bloquer une action"` retourne la liste exacte des events avec `Can Block? Yes`.

## Dependencies & Risks

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Documentation officielle change apres mars 2026 | Artefacts generes non conformes | Versionner les references (date dans le header), ajouter un check de freshness dans l'audit |
| Skills trop longs (>500 lignes) | Degradation de la qualite des instructions | Utiliser les imports `@` pour deleguer aux references, garder les SKILL.md concis |
| Qualite de generation variable | Artefacts incorrects ou incomplets | Templates solides + references exhaustives reduisent les hallucinations. L'audit post-generation est le filet de securite |
| Confusion avec `create-agent-skills` | Users ne savent pas lequel utiliser | README clair sur le positionnement : `claude-factory` est standalone et couvre tout, `create-agent-skills` est specifique a compound-engineering |

## Sources & References

### Origin

- **Origin document:** [docs/brainstorms/2026-03-30-claude-factory-requirements.md](docs/brainstorms/2026-03-30-claude-factory-requirements.md) — Key decisions: standalone plugin, prompt libre (pas wizard), documentation statique embarquee, nom `claude-factory`

### Internal References

- Plugin structure convention: `plugins/git/.claude-plugin/plugin.json`
- Skill pattern (simple): `plugins/git/skills/commit/SKILL.md`
- Skill pattern (router): compound-engineering `create-agent-skills/SKILL.md`
- Hook pattern: `plugins/security/hooks/hooks.json`, `plugins/security/scripts/block-sensitive-files.js`
- Agent pattern: `plugins/experts/agents/architect.md`
- Marketplace registry: `.claude-plugin/marketplace.json`

### External References

- [Claude Code Skills](https://code.claude.com/docs/en/skills) — official skill spec
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks) — official hooks spec (25+ events)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) — official agent spec
- [Claude Code Memory](https://code.claude.com/docs/en/memory) — CLAUDE.md + rules spec
- [Claude Code Settings](https://code.claude.com/docs/en/settings) — settings.json schema
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins-reference) — plugin spec
