# Plugin Experts

Collection d'agents experts spécialisés pour analyses approfondies.

## Installation

```bash
/plugin install experts@angelo-plugins
```

## Utilisation

### Avec Ultrathink (recommandé pour analyses complexes)

Pour une analyse en profondeur maximale, utilisez le mot-clé `ultrathink` :

```
ultrathink Analyse l'architecture du module orders
ultrathink Quelle est la dette technique de ce projet ?
ultrathink Comment faire évoluer vers une Clean Architecture ?
```

> **Opus + Ultrathink** = meilleure combinaison pour les décisions architecturales complexes

### Usage standard

L'agent se déclenche aussi sur les questions d'architecture sans ultrathink :

```
Analyse l'architecture du module authentication
Comment découper ce service monolithique ?
Compare les approches pour implémenter le caching
```

## Capacités

### Analyse de structure
- Séparation des responsabilités (SRP)
- Cohésion et couplage des modules
- God classes et fichiers trop volumineux
- Conventions de nommage
- Barrel files et re-exports

### Détection de patterns
- Patterns d'architecture (Clean, Hexagonal, DDD, CQRS, Vertical Slice...)
- Anti-patterns (Big Ball of Mud, Spaghetti, Distributed Monolith...)
- Code smells (Long Method, Feature Envy, Shotgun Surgery...)
- Violations DRY/SOLID/YAGNI

### Analyse de dépendances
- Graph des imports
- Dépendances circulaires
- Couplage avec librairies externes
- Points de contention
- Dépendances obsolètes/vulnérables

### Évaluation dette technique
- Code legacy
- TODOs/FIXMEs non résolus
- Tests manquants
- Dépendances obsolètes
- Code mort

### Analyse de performance
- Détection N+1 queries
- Stratégies de caching
- Pagination
- Index DB

### Propositions d'évolution
- Stratégies de refactoring progressif (Strangler Fig, Branch by Abstraction)
- Comparaison d'approches avec trade-offs
- Plans de migration réversibles

## Stacks supportées

L'agent est **agnostique** et s'adapte à la stack détectée :

| Stack | Spécificités analysées |
|-------|------------------------|
| **Node.js** (Hapi, Express, Fastify, NestJS) | Middleware, validation (Joi, Zod), async errors, transactions |
| **ORM** (Sequelize, Prisma, TypeORM) | Models, N+1, migrations, transactions, soft delete |
| **Vue/Nuxt** | Composants smart/dumb, Pinia/Vuex, SSR, routing |
| **React/Next** | Components, hooks, Server Components, React Query |
| **PostgreSQL/MySQL** | Schema, index, normalisation, JSON columns |
| **API Design** | REST/GraphQL, versioning, auth, rate limiting |

## Format de sortie

L'agent produit un rapport structuré :

1. **Contexte** - Stack, périmètre, question initiale
2. **Synthèse exécutive** - Findings principaux en 3-5 phrases
3. **Forces** - Ce qui est bien fait
4. **Faiblesses** - Problèmes par criticité (🔴 Critique, 🟠 Important, 🟡 Mineur)
5. **Analyse détaillée** - Avec extraits de code réels et localisation
6. **Recommandations** - Quick wins, moyen terme, long terme
7. **Trade-offs** - Tableau comparatif des options
8. **Réponse directe** - Synthèse actionnable

## Méthodologie

L'agent suit une méthodologie rigoureuse en 3 phases :

### Phase 1 : Reconnaissance (obligatoire)
- Détection de la stack technique
- Cartographie de la structure projet
- Identification des conventions locales
- Compréhension du contexte métier

### Phase 2 : Analyse approfondie
- Application des grilles d'analyse pertinentes
- Utilisation d'exemples concrets du code
- Exploration de toutes les dimensions

### Phase 3 : Rapport structuré
- Format standardisé et navigable
- Priorisation des actions
- Trade-offs documentés

## Composants

| Type | Nom | Description | Modèle |
|------|-----|-------------|--------|
| Agent | `architect` | Analyse architecturale approfondie | Opus |

## Exemples

### Analyse de module
```
ultrathink Analyse-moi l'architecture du module authentication
et dis-moi comment je pourrais améliorer sa testabilité
```

### Découpage de service
```
ultrathink J'ai un service UserService de 2000 lignes,
comment le découper proprement sans casser l'existant ?
```

### Évaluation dette
```
ultrathink Fais-moi un audit de dette technique du dossier src/legacy
avec une priorisation des actions
```

### Comparaison d'approches
```
Je dois implémenter un système de cache.
Compare Redis vs in-memory vs file-based pour mon contexte
```

### Évolution architecturale
```
ultrathink Comment migrer progressivement mon API monolithique
vers une architecture hexagonale ?
```

## Tips

- **Utilisez ultrathink** pour les décisions importantes - le surcoût en tokens est compensé par la qualité de l'analyse
- **Soyez précis** dans votre question pour obtenir une analyse ciblée
- **Mentionnez le contexte** (contraintes, deadline, équipe) pour des recommandations pragmatiques
- L'agent ne fait **jamais de recommandations** sans avoir lu le code concerné

## Sources

Ce plugin intègre les meilleures pratiques de :
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Extended Thinking Documentation](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
- [ClaudeLog - UltraThink](https://claudelog.com/faqs/what-is-ultrathink/)
