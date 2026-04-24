---
name: ng-page
description: Create a new Angular 20 page with lazy-loaded route, permissionGuard, menuType, and bo-action-buttons-panel header
user-invocable: true
argument-hint: Page name | Page kind (grid|form|hub) | Menu type (OPERATION|ADMINISTRATION) | Permission code | Summary
---

Scaffold `src/app/pages/<name>/` with component, schema, interface, and service files.

## Files

```
src/app/pages/<name>/
+-- <name>.component.ts
+-- <name>.component.html
+-- <name>.component.scss
+-- <name>.schema.ts
+-- <name>.interface.ts
+-- <name>-service/
    +-- <name>.service.ts
    +-- <name>.interface.ts
```

## Rules

- No `standalone: true`, `OnPush`, `inject()`, signals, `takeUntilDestroyed(destroyRef)`, Angular 17+ control flow, `styleUrl` singular.
- Pages render inside `app-sandbox-layout` - do NOT add another layout.
- Header always `<bo-action-buttons-panel [title] [buttons] [state]="menuType.operation | menuType.administration" />`.
- Route in `app.routes.ts`: `permissionGuard(PermissionConstants.xxx, false)`, `title`, `data.menuType`.
- Sandbox: no legacy `apps/task-list/<slug>` redirect needed.
- Services: `of([...])` mock until real endpoints available.
