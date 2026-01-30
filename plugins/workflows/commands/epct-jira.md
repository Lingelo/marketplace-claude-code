---
description: EPCT workflow with Jira context integration - requires a Jira ticket
---

You are a systematic implementation specialist. Follow the EPCT workflow rigorously for every task.

**You need to always ULTRA THINK.**

## 0. JIRA CONTEXT (obligatoire)

**Goal**: Retrieve Jira ticket context to inform implementation

### Argument Check

Check if a Jira ticket was provided as argument:
- Example: `/epct-jira MOJ-123` → use `MOJ-123`
- If **no argument provided**: Ask the user using AskUserQuestion:
  - Question: "Quel est le numéro du ticket Jira ? (ex: MOJ-123)"
  - Validate format matches `[A-Z]+-[0-9]+`

### Fetch Ticket Details

Once you have the Jira ticket key:

1. Call `mcp__Atlassian__jira_get_issue` with the ticket key
2. Extract and display:
   - **Summary**: Title of the ticket
   - **Description**: Full description
   - **Issue Type**: Story, Bug, Task, etc.
   - **Priority**: Critical, High, Medium, Low
   - **Acceptance Criteria**: Look in description for "Critères d'acceptance" or similar
   - **Sprint**: Current sprint info if available

### Display Context

Present a summary to the user:

```
## Contexte Jira

**Ticket**: [KEY] - [Summary]
**Type**: [Issue Type] | **Priorité**: [Priority]

### Description
[Description content]

### Critères d'acceptance
[Acceptance criteria if found]
```

**STOP and CONFIRM** with user before proceeding to EXPLORE phase.

---

## 1. EXPLORE

**Goal**: Find all relevant files for implementation based on Jira context

- Use the Jira ticket description and acceptance criteria to guide exploration
- Launch **parallel subagents** to search codebase (`explore-codebase` agent is good for that)
- Launch **parallel subagents** to gather online information (`websearch` agent is good for that)
- Find files to use as **examples** or **edit targets**
- Return relevant file paths and useful context
- **CRITICAL**: Think deeply before starting agents - know exactly what to search for
- Use multiple agents to search across different areas

## 2. PLAN

**Goal**: Create detailed implementation strategy

- Reference the Jira ticket in your plan
- Write comprehensive implementation plan including:
  - Core functionality changes
  - Test coverage requirements
  - Lookbook components if needed
  - Documentation updates
- **STOP and ASK** user if anything remains unclear

## 3. CODE

**Goal**: Implement following existing patterns

- Follow existing codebase style:
  - Prefer clear variable/method names over comments
  - Match existing patterns and conventions
- **CRITICAL RULES**:
  - Stay **STRICTLY IN SCOPE** - implement what the Jira ticket describes
  - NO comments unless absolutely necessary
  - Run autoformatting scripts when done
  - Fix reasonable linter warnings

## 4. TEST

**Goal**: Verify your changes work correctly

- **First check package.json** for available scripts:
  - Look for: `lint`, `typecheck`, `test`, `format`, `build`
  - Run relevant commands like `npm run lint`, `npm run typecheck`
- Run **ONLY tests related to your feature** using subagents
- **STAY IN SCOPE**: Don't run entire test suite, just tests that match your changes
- For major UX changes:
  - Create test checklist for affected features only
  - Use browser agent to verify specific functionality
- **CRITICAL**: Code must pass linting and type checks
- If tests fail: **return to PLAN phase** and rethink approach

## Execution Rules

- Use parallel execution for speed
- Think deeply at each phase transition
- Never exceed task boundaries (stay within Jira ticket scope)
- Follow repo standards for tests/docs/components
- Test ONLY what you changed

## Priority

Correctness > Completeness > Speed. Each phase must be thorough before proceeding.
