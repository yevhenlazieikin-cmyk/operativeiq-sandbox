---
name: review-conventions
description: Review changed files in task-list-fe against CLAUDE.md conventions and Angular 20 best practices
user-invocable: true
argument-hint: File path or glob pattern (optional, defaults to uncommitted changes)
---

Review code for violations of project conventions in CLAUDE.md.

If $ARGUMENTS provided, review those files. Otherwise: `git diff --name-only` + `git diff --cached --name-only`.

## Key checks

- No `standalone: true`
- `ChangeDetectionStrategy.OnPush`
- `styleUrl` singular
- `inject()` not constructor injection
- `takeUntilDestroyed(destroyRef)` not `ReplaySubject`
- `@if`/`@for`/`@switch` not `*ngIf`/`*ngFor`
- `@for` has `track` expression
- `<bo-action-buttons-panel>` for page headers
- `<bo-grid>` + `<bo-grid-cell>` for grids
- `@use 'variables' as *;` in SCSS, no raw hex
- Routes have `permissionGuard`, `title`, `data.menuType`
- No hardcoded URLs - always `environment.CLIENT_API`
- User-facing text via `MessageService.get('CODE')`

## Output format

```
### Violations Found
1. [CRITICAL] file:line - description -> fix
2. [WARNING] file:line - description -> fix

### Passed Checks
- ...
```
