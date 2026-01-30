#!/usr/bin/env node

/**
 * Claude Code PreToolUse Hook
 * Blocks access to sensitive files (.env, secrets, credentials, keys, etc.)
 *
 * Exit codes:
 *   0 = Allow the operation
 *   2 = Block the operation (message sent to stderr for Claude)
 */

const SENSITIVE_PATTERNS = [
  // Environment files
  /\.env$/i,
  /\.env\.[^/]+$/i,
  /\.env\.local$/i,
  /\.env\.development$/i,
  /\.env\.production$/i,
  /\.env\.test$/i,

  // Secret/credential files
  /secrets?\//i,
  /credentials?\//i,
  /\.secrets?$/i,
  /\.credentials?$/i,

  // Key files
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /\.jks$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /id_ecdsa/i,
  /id_dsa/i,

  // Config files with potential secrets
  /\.npmrc$/i,
  /\.pypirc$/i,
  /\.netrc$/i,
  /\.docker\/config\.json$/i,
  /\.kube\/config$/i,
  /\.aws\/credentials$/i,
  /\.aws\/config$/i,

  // Firebase/GCP
  /firebase.*\.json$/i,
  /service[-_]?account.*\.json$/i,
  /gcloud.*\.json$/i,

  // Other sensitive patterns
  /\.htpasswd$/i,
  /\.pgpass$/i,
  /\.my\.cnf$/i
];

// Exceptions - files that should NOT be blocked even if they match sensitive patterns
const WHITELISTED_PATTERNS = [
  /\.env\.example$/i
];

// Commands that read file contents
const FILE_READ_COMMANDS = [
  /\bcat\s+/,
  /\bhead\s+/,
  /\btail\s+/,
  /\bless\s+/,
  /\bmore\s+/,
  /\bvi\s+/,
  /\bvim\s+/,
  /\bnano\s+/,
  /\bcode\s+/,
  /\bopen\s+/
];

function isSensitivePath(filePath) {
  if (!filePath) return false;

  // Check if the file is whitelisted (exceptions)
  if (WHITELISTED_PATTERNS.some(pattern => pattern.test(filePath))) {
    return false;
  }

  return SENSITIVE_PATTERNS.some(pattern => pattern.test(filePath));
}

function extractPathsFromCommand(command) {
  if (!command) return [];

  // Simple extraction of potential file paths from command
  const paths = [];
  const tokens = command.split(/\s+/);

  for (const token of tokens) {
    // Skip flags
    if (token.startsWith('-')) continue;
    // Check if it looks like a path
    if (token.includes('.') || token.includes('/')) {
      paths.push(token);
    }
  }

  return paths;
}

function checkBashCommand(command) {
  if (!command) return null;

  // Check if command uses file-reading utilities
  const isReadCommand = FILE_READ_COMMANDS.some(pattern => pattern.test(command));

  if (isReadCommand) {
    const paths = extractPathsFromCommand(command);
    for (const path of paths) {
      if (isSensitivePath(path)) {
        return path;
      }
    }
  }

  return null;
}

async function main() {
  let inputData = '';

  // Read JSON from stdin
  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  let data;
  try {
    data = JSON.parse(inputData);
  } catch {
    // If we can't parse input, allow the operation
    process.exit(0);
  }

  const toolName = data.tool_name || '';
  const toolInput = data.tool_input || {};

  // Check Read, Edit, Write tools
  if (['Read', 'Edit', 'Write'].includes(toolName)) {
    const filePath = toolInput.file_path || toolInput.path || '';

    if (isSensitivePath(filePath)) {
      process.stderr.write(
        `BLOCKED: Access to "${filePath}" is denied. ` +
        `This file may contain sensitive information (secrets, credentials, API keys). ` +
        `Please ask the user to provide the necessary information directly.`
      );
      process.exit(2);
    }
  }

  // Check Bash commands
  if (toolName === 'Bash') {
    const command = toolInput.command || '';
    const blockedPath = checkBashCommand(command);

    if (blockedPath) {
      process.stderr.write(
        `BLOCKED: Command attempts to read "${blockedPath}" which may contain sensitive information. ` +
        `Please ask the user to provide the necessary information directly.`
      );
      process.exit(2);
    }
  }

  // Allow the operation
  process.exit(0);
}

main().catch(() => process.exit(0));
