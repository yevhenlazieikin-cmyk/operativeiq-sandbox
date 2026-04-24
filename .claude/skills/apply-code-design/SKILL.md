---
name: apply-code-design
description: Create a new Angular 20 page from a plain-text description - page name, menuType, page kind, permissions, and business requirements - without a Figma design
user-invocable: true
argument-hint: Page name | Menu type (OPERATION|ADMINISTRATION) | Page kind (grid|form|hub) | Permission code | Business requirements
allowed-tools: Read Glob Grep Edit Write Bash(npx tsc --noEmit)
---

Create a fully functional Angular page from a plain-text description.

Parse $ARGUMENTS:
- **[name]**: kebab-case page name and folder (e.g. `unit-inspections`).
- **[menuType]**: `OPERATION` or `ADMINISTRATION`.
- **[kind]**: `grid` | `form` | `hub`.
- **[permission]**: PermissionConstants key. Invent `oi_<name>_view` if missing and flag.
- **[requirements]**: business requirements.

## Workflow

1. Plan: state page shell, permissions, route, resolvers, data, dialogs. Wait for approval.
2. Scaffold via `/ng-page` -> `/ng-grid` -> `/ng-dialog` -> `/ng-component` as needed.
3. Add `PermissionConstants` entries to `permission.constants.ts`.
4. Register route in `app.routes.ts` with `permissionGuard`, `title`, `data.menuType`.
5. Sandbox: no legacy redirect needed. Use `of([...])` for mock data.
6. Run `npx tsc --noEmit`. Report back: files, route path, mock data, follow-ups.
