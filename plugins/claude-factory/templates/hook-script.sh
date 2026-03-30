#!/usr/bin/env bash

# {{DESCRIPTION}}
#
# Hook: {{EVENT}} | Matcher: {{MATCHER}}
# Exit 0 = allow | Exit 2 = block (stderr shown to Claude)

set -euo pipefail

# Read JSON from stdin
INPUT=$(cat)

# Parse with jq (if available) or node
if command -v jq &>/dev/null; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
  # Add more field extraction as needed
else
  TOOL_NAME=$(echo "$INPUT" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{try{console.log(JSON.parse(d).tool_name||'')}catch{console.log('')}})
  ")
fi

# {{LOGIC_DESCRIPTION}}
# Example: block if condition is met
# if [[ "$TOOL_NAME" == "dangerous_tool" ]]; then
#   echo "Blocked: reason" >&2
#   exit 2
# fi

exit 0
