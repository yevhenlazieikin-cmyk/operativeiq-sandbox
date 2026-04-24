---
name: implement-jira-task
description: Fetch a Jira task, analyze requirements, draft a plan, wait for approval, then implement
user-invocable: true
argument-hint: Jira task link (required) | Implementation description (optional)
allowed-tools: mcp__jira__jira_get Read Glob Grep Edit Write Bash(git *) Bash(npm *) Bash(npx *)
---

Not typically applicable inside the sandbox - use for task-list-fe tickets.

Fetch Jira task -> analyze -> plan -> get approval -> implement using appropriate skills.

Never commit or push. User runs `/create-mr` when ready.
