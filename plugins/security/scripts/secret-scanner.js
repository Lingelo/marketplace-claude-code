#!/usr/bin/env node

/**
 * Claude Code PreToolUse Hook — Secret Scanner
 * Scans staged git changes for leaked secrets (API keys, tokens, credentials)
 * before allowing a git commit to proceed.
 *
 * Exit codes:
 *   0 = Allow the operation
 *   2 = Block the operation (message sent to stderr for Claude)
 */

const { execSync } = require('child_process');

// ─── Secret patterns (~30 regex covering major providers) ───────────────────

const SECRET_PATTERNS = [
  // AI / ML
  { name: 'Anthropic API Key',      regex: /sk-ant-api[a-zA-Z0-9_-]{20,}/ },
  { name: 'Anthropic Admin Key',    regex: /sk-ant-admin[a-zA-Z0-9_-]{20,}/ },
  { name: 'OpenAI API Key',         regex: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'HuggingFace Token',      regex: /hf_[a-zA-Z0-9]{20,}/ },

  // Cloud providers
  { name: 'AWS Access Key ID',      regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Key',         regex: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*[A-Za-z0-9/+=]{40}/ },
  { name: 'Google API Key',         regex: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'DigitalOcean PAT',       regex: /dop_v1_[a-f0-9]{64}/ },
  { name: 'HashiCorp Vault Token',  regex: /hv[sb]\.[a-zA-Z0-9_-]{24,}/ },

  // Git platforms
  { name: 'GitHub Token (PAT)',     regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub OAuth Token',     regex: /gho_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub App Token',       regex: /ghs_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub Fine-grained',    regex: /github_pat_[a-zA-Z0-9_]{22,}/ },
  { name: 'GitLab PAT',             regex: /glpat-[a-zA-Z0-9_-]{20,}/ },
  { name: 'GitLab Pipeline Trigger', regex: /glptt-[a-zA-Z0-9_-]{20,}/ },
  { name: 'GitLab Runner Token',    regex: /glrt-[a-zA-Z0-9_-]{20,}/ },

  // CI/CD & Registries
  { name: 'npm Token',              regex: /npm_[a-zA-Z0-9]{36,}/ },
  { name: 'PyPI Token',             regex: /pypi-[a-zA-Z0-9_-]{16,}/ },

  // Communication
  { name: 'Slack Token',            regex: /xox[bpars]-[a-zA-Z0-9-]{10,}/ },
  { name: 'Slack App Token',        regex: /xapp-[a-zA-Z0-9-]{10,}/ },
  { name: 'Slack Webhook URL',      regex: /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/ },
  { name: 'Discord Bot Token',      regex: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27,}/ },

  // Payments
  { name: 'Stripe Secret Key',      regex: /sk_live_[a-zA-Z0-9]{20,}/ },
  { name: 'Stripe Publishable Key', regex: /pk_live_[a-zA-Z0-9]{20,}/ },
  { name: 'Shopify Token',          regex: /shp(?:at|ca|pa|ss)_[a-fA-F0-9]{32,}/ },

  // Auth & Keys
  { name: 'JWT Token',              regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ },
  { name: 'Private Key',            regex: /-----BEGIN\s(?:RSA\s|EC\s|DSA\s|OPENSSH\s)?PRIVATE\sKEY-----/ },
  { name: 'Generic API Key',        regex: /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]{16,}['"]/ },

  // Services
  { name: 'Twilio API Key',         regex: /SK[a-f0-9]{32}/ },
  { name: 'SendGrid API Key',       regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/ },
  { name: 'Mailgun API Key',        regex: /key-[a-zA-Z0-9]{32}/ },
  { name: 'Sentry Token',           regex: /sntrys_[a-zA-Z0-9_-]{20,}/ },

  // Database URLs with embedded passwords
  { name: 'Database URL',           regex: /(?:postgres|mysql|mongodb):\/\/[^:]+:[^@]+@/ },
];

// ─── False positive allowlist ───────────────────────────────────────────────

const FALSE_POSITIVE_TERMS = [
  'example', 'test', 'dummy', 'placeholder', 'changeme',
  'xxx', 'todo', 'your_', 'insert_', 'replace_', 'fake',
  'sample', 'mock', 'xxxxxxxxx',
];

// ─── Paths to skip (unlikely to contain real secrets, noisy) ────────────────

const SKIP_PATH_PATTERNS = [
  /^vendor\//,
  /node_modules\//,
  /\.lock$/,
  /\.sum$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.map$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function truncateSecret(value, len = 8) {
  if (!value) return '';
  return value.length > len ? value.substring(0, len) + '...' : value;
}

function isFalsePositive(matchedValue) {
  const lower = matchedValue.toLowerCase();
  return FALSE_POSITIVE_TERMS.some(term => lower.includes(term));
}

function shouldSkipFile(filePath) {
  return SKIP_PATH_PATTERNS.some(pattern => pattern.test(filePath));
}

function getStagedDiff() {
  try {
    return execSync('git diff --cached', {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    // Not a git repo or git not available — fail-open
    return null;
  }
}

function scanDiff(diff) {
  const findings = [];
  let currentFile = null;

  const lines = diff.split('\n');

  for (const line of lines) {
    // Track current file from diff headers
    if (line.startsWith('+++ b/')) {
      currentFile = line.substring(6);
      continue;
    }

    // Skip non-addition lines (removals, context, headers)
    if (!line.startsWith('+') || line.startsWith('+++')) {
      continue;
    }

    // Skip files in excluded paths
    if (currentFile && shouldSkipFile(currentFile)) {
      continue;
    }

    const addedContent = line.substring(1); // strip leading '+'

    for (const pattern of SECRET_PATTERNS) {
      const match = pattern.regex.exec(addedContent);
      if (match && !isFalsePositive(match[0])) {
        findings.push({
          name: pattern.name,
          file: currentFile || 'unknown',
          value: truncateSecret(match[0]),
        });
      }
    }
  }

  return findings;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  let inputData = '';

  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  let data;
  try {
    data = JSON.parse(inputData);
  } catch {
    process.exit(0);
  }

  const toolName = data.tool_name || '';
  const toolInput = data.tool_input || {};

  // Only intercept Bash commands
  if (toolName !== 'Bash') {
    process.exit(0);
  }

  const command = toolInput.command || '';

  // Block --no-verify on git commit (prevents bypassing git hooks)
  if (/\bgit\b.*\bcommit\b.*--no-verify/.test(command)) {
    process.stderr.write(
      'BLOCKED: "git commit --no-verify" is not allowed. ' +
      'Skipping git hooks can bypass security checks. ' +
      'Please run the commit without --no-verify.'
    );
    process.exit(2);
  }

  // Only scan on git commit commands
  if (!/\bgit\b.*\bcommit\b/.test(command)) {
    process.exit(0);
  }

  // Get staged diff
  const diff = getStagedDiff();
  if (!diff) {
    // No diff or not a git repo — allow
    process.exit(0);
  }

  // Scan for secrets
  const findings = scanDiff(diff);

  if (findings.length > 0) {
    // Deduplicate findings by name+file
    const unique = [];
    const seen = new Set();
    for (const f of findings) {
      const key = `${f.name}:${f.file}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(f);
      }
    }

    const details = unique
      .map(f => `  - ${f.name} in ${f.file} (matched: ${f.value})`)
      .join('\n');

    process.stderr.write(
      `BLOCKED: Potential secrets detected in staged changes. Commit aborted.\n\n` +
      `Found ${unique.length} potential secret(s):\n` +
      `${details}\n\n` +
      `Please remove these secrets before committing. ` +
      `Consider using environment variables or a secrets manager.`
    );
    process.exit(2);
  }

  // No secrets found — allow
  process.exit(0);
}

main().catch(() => process.exit(0));
