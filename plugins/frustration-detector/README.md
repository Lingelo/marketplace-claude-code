# Plugin Frustration Detector

Détecte la frustration du développeur dans ses prompts et injecte du contexte pour que Claude adapte automatiquement son style de réponse : moins de blabla, plus d'action.

## Installation

```bash
/plugin install frustration-detector@angelo-plugins
```

## Fonctionnalités

Un hook `UserPromptSubmit` analyse chaque message avant qu'il soit traité et injecte du contexte adapté quand de la frustration est détectée.

### 4 types de frustration détectés

| Type | Déclencheurs | Réaction de Claude |
|------|-------------|-------------------|
| **Colère** | Jurons (FR/EN), insultes, blâme (`putain`, `fuck`, `wtf`, `tu as tout cassé`...) | Mode action silencieuse : zéro préambule, code uniquement |
| **Impatience** | Anti-verbosité (`finis`, `just do it`, `arrête d'expliquer`, `code only`...) | Zéro explication, choix autonomes, tâche complète en 1 réponse |
| **Confusion** | Blocage (`ça marche pas`, `I'm stuck`, `je comprends rien`, `same error`...) | Diagnostic bref + fix immédiat, exemples concrets |
| **Sarcasme** | Résignation (`merci pour rien`, `I'll use Cursor`, `laisse tomber`...) | Action immédiate, pas d'excuses, solution concrète |

### Signaux amplificateurs

- Messages en MAJUSCULES
- Ponctuation excessive (`???`, `!!!`, `?!?!`)
- Messages très courts contenant des termes de frustration

### Mitigation des faux positifs

- Les termes d'impatience courants (`continue`, `go on`, `allez`) ne déclenchent l'injection que dans les messages courts (< 20 mots)
- Le script ne bloque jamais les prompts (exit 0 toujours) — il ajoute uniquement du contexte

### Couverture linguistique

- **Français** : ~100 termes/expressions (jurons, argot, SMS)
- **Anglais** : ~100 termes/expressions (swear words, slang, abbreviations)
- **Onomatopées** : `argh`, `ugh`, `grr`, `pfff`, `raaah`...
- **Abréviations** : `wtf`, `ffs`, `omfg`, `jfc`, `fml`, `stfu`
- **Passif-agressif** : `comme je t'ai dit`, `I already told you`, `wrong again`...

## Fonctionnement

```
Utilisateur tape "putain ça marche pas"
  → Hook UserPromptSubmit déclenché
  → Script détecte : colère + confusion
  → Injection contexte : "Mode action maximale + diagnostic bref"
  → Claude répond avec un fix direct, sans blabla
```

Le script ne bloque jamais le prompt (exit code 0). Il injecte du contexte via `stdout` JSON avec `additionalContext` pour guider la réponse de Claude.

## Structure

```
frustration-detector/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json
├── scripts/
│   └── detect-frustration.js
└── README.md
```
