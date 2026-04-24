---
name: apply-figma-design
description: Implement Angular 20 code from a Figma design URL using project conventions and backoffice-shared-ui components
user-invocable: true
argument-hint: Figma URL | Additional instructions (optional)
allowed-tools: mcp__figma__get_design_context mcp__figma__get_screenshot mcp__figma__get_metadata mcp__figma__search_design_system Read Glob Grep Edit Write Bash(npx tsc --noEmit)
---

Parse $ARGUMENTS: **[url]** (REQUIRED), **[instructions]** (optional).

If url is missing, stop and ask.

## Workflow

1. Call `mcp__figma__get_design_context` with fileKey + nodeId from URL (convert `-` to `:` in nodeId).
2. Analyze: scope (page vs widget), kind (grid/form/hub), menuType, shared-ui pieces, design tokens.
3. Plan and confirm before writing code.
4. Delegate: `/ng-page` -> `/ng-grid` -> `/ng-dialog` -> `/ng-component`.
5. Verify: `npx tsc --noEmit`, visual match against screenshot.
6. Report back.

Never paste raw React/Tailwind. Always re-express as Angular 20 + `@backoffice/shared-ui`.
