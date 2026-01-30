# Nettoyage des plugins en erreur

Détecte et supprime les plugins orphelins ou en erreur.

## Instructions

### 1. Scanner les plugins installés

Lire `~/.claude/settings.json` et extraire la liste des `enabledPlugins`.

### 2. Vérifier chaque plugin

Pour chaque plugin activé (`true`), vérifier :

```bash
# Vérifier si le cache existe
ls ~/.claude/plugins/cache/<marketplace>/<plugin-name>/ 2>/dev/null
```

Un plugin est **orphelin** si :
- Le dossier cache n'existe pas
- Le dossier cache est vide
- Le fichier `plugin.json` est absent ou invalide

### 3. Lister les problèmes détectés

Afficher un tableau récapitulatif :

```
Plugins en erreur détectés :

| Plugin | Marketplace | Problème |
|--------|-------------|----------|
| commit | angelo-plugins | Cache absent |
| xxx | yyy | plugin.json invalide |
```

Si aucun problème : afficher "Aucun plugin en erreur détecté."

### 4. Demander confirmation

Utiliser AskUserQuestion :
- **Question** : "Voulez-vous supprimer ces plugins ?"
- **Options** :
  - "Oui, tout supprimer" (recommandé)
  - "Non, annuler"

### 5. Nettoyer

Si l'utilisateur confirme :

**Pour chaque plugin orphelin :**

1. Supprimer du cache (si existe) :
```bash
rm -rf ~/.claude/plugins/cache/<marketplace>/<plugin-name>
```

2. Supprimer de `settings.json` :
   - Lire le fichier
   - Retirer l'entrée du plugin dans `enabledPlugins`
   - Écrire le fichier mis à jour

### 6. Récapitulatif

```
Nettoyage terminé !

Plugins supprimés :
- commit@angelo-plugins
- xxx@yyy

Redémarrez Claude Code pour appliquer les changements.
```

## Notes

- Ne supprime que les plugins en erreur, pas les plugins désactivés (`false`)
- Sauvegarde automatique de `settings.json` avant modification (optionnel)
- Compatible avec plusieurs marketplaces
