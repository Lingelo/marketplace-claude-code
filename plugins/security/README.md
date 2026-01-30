# Plugin Security

Bloque l'accès de Claude Code aux fichiers sensibles contenant des secrets, credentials et clés API.

## Installation

```bash
/plugin install security@angelo-plugins
```

## Fonctionnalités

Intercepte et bloque automatiquement l'accès aux fichiers sensibles via un hook `PreToolUse`.

### Patterns de fichiers bloqués

| Catégorie | Patterns |
|----------|----------|
| Environnement | `.env`, `.env.*`, `.env.local`, `.env.production` |
| Secrets | `secrets/`, `credentials/`, `.secrets` |
| Clés | `.pem`, `.key`, `.p12`, `id_rsa`, `id_ed25519` |
| Cloud | `.aws/credentials`, `.kube/config`, `firebase*.json`, `service-account*.json` |
| Auth | `.npmrc`, `.pypirc`, `.netrc`, `.htpasswd` |

### Outils interceptés

- `Read` - Lecture de fichiers
- `Edit` - Modification de fichiers
- `Write` - Création de fichiers
- `Bash` - Commandes comme `cat`, `head`, `tail` sur fichiers sensibles

## Fonctionnement

Le plugin utilise un hook `PreToolUse` qui s'exécute avant chaque appel d'outil. Si un fichier sensible est détecté, l'opération est bloquée avec le code de sortie `2` et un message d'erreur est envoyé à Claude.

## Structure

```
security/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json
└── scripts/
    └── block-sensitive-files.js
```
