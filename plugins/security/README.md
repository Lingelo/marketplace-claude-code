# Plugin Security

Bloque l'accès de Claude Code aux fichiers sensibles et scanne les commits git pour détecter les secrets avant qu'ils ne soient poussés en production.

## Installation

```bash
/plugin install security@angelo-plugins
```

## Fonctionnalités

### 1. Blocage des fichiers sensibles

Intercepte et bloque automatiquement l'accès aux fichiers sensibles via un hook `PreToolUse`.

#### Patterns de fichiers bloqués

| Catégorie | Patterns |
|----------|----------|
| Environnement | `.env`, `.env.*`, `.env.local`, `.env.production` |
| Secrets | `secrets/`, `credentials/`, `.secrets` |
| Clés | `.pem`, `.key`, `.p12`, `id_rsa`, `id_ed25519` |
| Cloud | `.aws/credentials`, `.kube/config`, `firebase*.json`, `service-account*.json` |
| Auth | `.npmrc`, `.pypirc`, `.netrc`, `.htpasswd` |

#### Outils interceptés

- `Read` - Lecture de fichiers
- `Edit` - Modification de fichiers
- `Write` - Création de fichiers
- `Bash` - Commandes comme `cat`, `head`, `tail` sur fichiers sensibles

### 2. Secret Scanner (pre-commit)

Scanne le contenu des fichiers stagés (`git diff --cached`) avant chaque `git commit` pour détecter les clés API, tokens et credentials qui pourraient fuiter.

#### Patterns de secrets détectés (~30 regex)

| Catégorie | Secrets détectés |
|-----------|-----------------|
| AI / ML | Anthropic API Key (`sk-ant-api`), Anthropic Admin Key (`sk-ant-admin`), OpenAI (`sk-`), HuggingFace (`hf_`) |
| Cloud | AWS Access Key (`AKIA`), AWS Secret Key, Google API (`AIza`), DigitalOcean (`dop_v1_`), HashiCorp Vault (`hvs.`, `hvb.`) |
| Git | GitHub PAT (`ghp_`), OAuth (`gho_`), App (`ghs_`), Fine-grained (`github_pat_`), GitLab PAT (`glpat-`), Pipeline (`glptt-`), Runner (`glrt-`) |
| CI/CD | npm (`npm_`), PyPI (`pypi-`) |
| Communication | Slack (`xox[bpars]-`, `xapp-`, webhooks), Discord bot tokens |
| Paiements | Stripe (`sk_live_`, `pk_live_`), Shopify (`shpat_`, `shpca_`, `shppa_`, `shpss_`) |
| Auth | JWT (`eyJ...`), Private Keys (RSA, EC, DSA, OPENSSH), Generic API Key patterns |
| Services | Twilio (`SK`), SendGrid (`SG.`), Mailgun (`key-`), Sentry (`sntrys_`) |
| Data | Database URLs avec mots de passe (postgres, mysql, mongodb) |

#### Protections supplémentaires

- **Blocage de `--no-verify`** : empêche Claude de contourner les hooks git via `git commit --no-verify`
- **Mitigation des faux positifs** : les valeurs contenant `example`, `test`, `dummy`, `placeholder`, `changeme`, `fake`, `sample`, `mock` sont ignorées
- **Exclusion de paths** : les fichiers dans `vendor/`, `node_modules/`, `*.lock`, `*.min.js`, `*.map` sont ignorés
- **Fail-open** : si `git diff --cached` échoue (pas un repo git), le commit est autorisé
- **Scan des ajouts uniquement** : seules les lignes `+` du diff sont scannées (supprimer un secret ne bloque pas)

## Fonctionnement

Le plugin utilise deux hooks `PreToolUse` :

1. **block-sensitive-files.js** — s'exécute sur Read, Edit, Write, Bash. Bloque l'accès aux fichiers sensibles.
2. **secret-scanner.js** — s'exécute sur Bash uniquement. Intercepte les `git commit`, scanne le diff stagé pour détecter les secrets.

Les deux hooks utilisent le code de sortie `2` pour bloquer et envoient un message sur stderr pour informer Claude.

## Structure

```
security/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json
├── scripts/
│   ├── block-sensitive-files.js
│   └── secret-scanner.js
└── README.md
```
