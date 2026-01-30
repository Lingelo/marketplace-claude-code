# Plugin Maintenance

Outils de maintenance pour Claude Code.

## Installation

```bash
/plugin install maintenance@angelo-plugins
```

## Commandes

### `/plugin-clean`

Détecte et supprime les plugins orphelins ou en erreur.

**Usage :**
```bash
/plugin-clean
```

**Fonctionnalités :**
- Scanne tous les plugins activés dans `settings.json`
- Détecte les plugins dont le cache est absent ou corrompu
- Propose la suppression avec confirmation
- Nettoie le cache + settings.json

**Exemple de sortie :**
```
Plugins en erreur détectés :

| Plugin | Marketplace | Problème |
|--------|-------------|----------|
| commit | angelo-plugins | Cache absent |
| old-plugin | other-marketplace | plugin.json invalide |

Voulez-vous supprimer ces plugins ?
```
