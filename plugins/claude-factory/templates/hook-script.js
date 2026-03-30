#!/usr/bin/env node

/**
 * {{DESCRIPTION}}
 *
 * Hook: {{EVENT}} | Matcher: {{MATCHER}}
 * Exit 0 = allow | Exit 2 = block (stderr shown to Claude)
 */

"use strict";

const fs = require("fs");

// Read JSON input from stdin
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    // {{EVENT}} hook receives:
    // - data.tool_name (PreToolUse/PostToolUse)
    // - data.tool_input (PreToolUse)
    // - data.tool_output (PostToolUse)
    // - data.stop_hook_active (Stop)

    const result = evaluate(data);

    if (result.block) {
      process.stderr.write(result.reason);
      process.exit(2);
    }

    // Optional: return structured JSON
    if (result.output) {
      process.stdout.write(JSON.stringify(result.output));
    }
    process.exit(0);
  } catch (err) {
    // Non-blocking error — continue
    process.stderr.write(`Hook error: ${err.message}`);
    process.exit(1);
  }
});

function evaluate(data) {
  // {{LOGIC_DESCRIPTION}}
  return { block: false, reason: "" };
}
