---
name: apply-code-design
description: Create a new Angular 20 page in task-list-fe from a plain-text description — page name, menuType, page kind, permissions, and business requirements — without a Figma design
user-invocable: true
argument-hint: Page name | Menu type (OPERATION|ADMINISTRATION) | Page kind (grid|form|hub) | Permission code | Business requirements
allowed-tools: Read Glob Grep Edit Write Bash(npm start) Bash(npm run lint:all) Bash(npm run lint:all:fix) Bash(npx tsc --noEmit)
---

Create a fully functional Angular page from a plain-text description. No Figma URL needed — the user describes what they want, and you build it using task-list-fe conventions and existing shared-ui components.

Parse $ARGUMENTS to extract:

- **[name]**: page name in kebab-case (e.g. `unit-inspections`). Derive PascalCase class name (e.g. `UnitInspectionsComponent`). This is the folder name AND the short route path.
- **[menuType]**: `OPERATION` or `ADMINISTRATION` — drives header colour scheme.
- **[kind]**: page variant:
  - `grid` — list/table page with `bo-grid`, `FilterData`, `GridCustomizationService` → delegate to `/ng-grid`
  - `form` — details/edit page with `bo-details-panel` + `FieldConfig[]` → delegate to `/ng-page` (form section)
  - `hub` — composite (details panel + grid + comments/history), like `task-management` → delegate to `/ng-page` (hub section)
- **[permission]**: page code(s) for `PermissionConstants` (e.g. `oi_unit_inspections_view`). If missing, ask or invent a plausible one and flag for backend confirmation.
- **[requirements]**: business requirements / feature description for the page content.

If any argument is missing, infer sensible defaults and state what you inferred:
- No menuType → `OPERATION` (most list pages)
- No kind → infer from requirements ("list with filters" → `grid`, "edit form" → `form`, "details + comments" → `hub`)
- No permission → propose `oi_<name>_view` / `oi_<name>_manage` and mark as *needs backend confirmation*

---

## Workflow

### Step 1 — Plan the page

Restate the user's description back in structured form before writing code:

1. **Page shell** — derived from `[kind]` + `[menuType]`:
   - header: `<bo-action-buttons-panel [title]="…" [buttons]="…" [state]="menuType.operation | menuType.administration" />`
   - body: grid / details panel / hub per kind (see §2)
2. **Permissions** — list the `PermissionConstants` entries you'll add (view + optional manage).
3. **Route registration** — the short path + mandatory `apps/task-list/<slug>` legacy redirect.
4. **Resolvers** — pick only from `core/resolvers/`:
   - `timeZoneResolver` — needed if you render timestamps
   - `supplyRoomResolver` — needed if filters/fields reference supply rooms
   - `unitResolver` — needed if filters/fields reference units
5. **Data** — backend endpoint (if known) OR realistic mock data (3–5 items matching the requirements). Call out any missing endpoints as *backend dependency*.
6. **Dialogs / pickers** — list any `BaseDialog` / `ConfigurableDialog` / `BaseSelectEntityDialog` usages → delegate to `/ng-dialog`.

Present this plan to the user and wait for approval before touching code. Don't ask every time for obvious defaults — only pause when there's a real decision (naming, permission code, menuType for an ambiguous page).

### Step 2 — Scaffold the page

Delegate to `/ng-page` with the chosen `[kind]` and `[menuType]`. That skill creates:

```
src/app/pages/<name>/
├── <name>.component.ts
├── <name>.component.html
├── <name>.component.scss
├── <name>.schema.ts
├── <name>.interface.ts
└── <name>-service/
    ├── <name>.service.ts
    └── <name>.interface.ts
```

For grid pages additionally delegate the filter/schema wiring to `/ng-grid`.
For any selection dialog, delegate to `/ng-dialog`.
For any reusable widget you introduce on the way, delegate to `/ng-component`.

### Step 3 — Add permission constants

Edit `src/app/core/constants/permission.constants.ts`:

```typescript
export const PermissionConstants = {
  ...,
  unitInspectionsView:   { PageCodes: ['oi_unit_inspections_view'] },
  unitInspectionsManage: { PageCodes: ['oi_unit_inspections_manage'] }
};
```

If the codes don't exist in the backend yet, note this as a follow-up when reporting back.

### Step 4 — Register the route

Edit `src/app/app.routes.ts`. ALWAYS add the legacy redirect + new short path together:

```typescript
{
  path: 'apps/task-list/unit-inspections',
  redirectTo: 'unit-inspections'
},
{
  path: 'unit-inspections',
  loadComponent: () => import('./pages/unit-inspections/unit-inspections.component').then(c => c.UnitInspectionsComponent),
  canActivate: [permissionGuard(PermissionConstants.unitInspectionsView, false)],
  title: 'Unit Inspections',
  data: { menuType: 'OPERATION' },      // match header state
  resolve: {                            // only what the page consumes
    timeZones: timeZoneResolver,
    supplyRooms: supplyRoomResolver,
    units: unitResolver
  }
}
```

For pages with `manage` / `manage/:id`, mirror the `task-list-setup/task-list-management` pattern — two routes sharing the same `loadComponent` with different titles (`New X` / `Edit X`).

### Step 5 — Page shell

Every page body renders **inside** the `<bo-layout>` + `<router-outlet>` already mounted in `src/app/app.html`. Do not wrap it in another layout.

```html
<bo-action-buttons-panel
  [title]="'Unit Inspections'"
  [buttons]="actionButtons"
  [state]="menuType.operation" />

<!-- kind-specific body (grid / details-panel / hub) -->
```

Use `menuType.operation` or `menuType.administration` to match the route's `data.menuType`.

### Step 6 — Component basics

Follow `/ng-component` / `/ng-page` conventions:

- No `standalone: true` (Angular 20 default).
- `changeDetection: ChangeDetectionStrategy.OnPush`.
- `inject()` for DI — no constructor injection.
- `styleUrl` (singular).
- `signal` / `computed` / `input()` / `output()` for reactive state.
- `takeUntilDestroyed(this.destroyRef)` for subscriptions — no `ReplaySubject<void>(1)`.
- Angular 17+ control flow (`@if`, `@for`, `@switch`).
- `ReactiveFormsModule` with `inject(FormBuilder)` for forms. Use `FormsModule` only when a shared widget explicitly needs `ngModel` (e.g. `bo-slide-toggle`).

### Step 7 — Mock data vs real endpoints

If the backend endpoint is not yet available or not specified:

1. Create the HTTP service shell anyway (`<name>-service/<name>.service.ts`) with the endpoint URL commented out.
2. Return realistic mock data from the service as `of([...])` so the page is self-contained.
3. Add a TODO comment tagged with the Jira key if you have one.
4. Flag the missing endpoint in the report back to the user.

Never hardcode URLs — always `${environment.CLIENT_API}/…` when the endpoint is known.

### Step 8 — User-facing text

- Headings, button labels on the page header itself — inline string is fine.
- Validation messages, confirmation dialog bodies, toast notifications — go through `MessageService.get('CODE')` with entries added to `src/assets/data/messages.json`. Never hardcode.

### Step 9 — Styling

```scss
@use 'variables' as *;

.table-wrapper { background-color: $white; }
```

- Use shared SCSS tokens (`$white`, `$error-red`, `$forest-green`, `$ocean-blue`, `$font-base2`, `$font-semibold`, …). No raw hex where a token exists.
- Reach into shared-ui via `::ng-deep` only as a last resort.
- The `menuType` on `bo-action-buttons-panel` already applies the correct colour scheme — don't re-paint the header.

### Step 10 — Verify

1. `npx tsc --noEmit` — compiles.
2. `npm run lint:all` — passes (fix with `npm run lint:all:fix`).
3. If `npm start` is running, open the page and confirm:
   - Permission gating fires (no access → redirected to `/`).
   - Header state matches the route's `data.menuType`.
   - Resolvers pre-populate lookups.
   - For grid pages: filter / sort / column-setup persist via `GridFilterStorage` + `GridCustomizationService`.
4. Report back:
   - Created / modified files.
   - The route path to exercise (`/unit-inspections` and the legacy `apps/task-list/unit-inspections`).
   - Follow-ups: missing backend endpoint, permission codes to confirm, messages to translate, tests to add.

---

## Delegation cheat-sheet

| Feature in [requirements] | Delegate to |
|---|---|
| List / table with filters | `/ng-grid` |
| New page shell (any kind) | `/ng-page` |
| Reusable widget (dumb component) | `/ng-component` |
| Confirm / form / picker dialog | `/ng-dialog` |
| Details / edit form | `/ng-page` (form section — `bo-details-panel` + `FieldConfig[]`) |
| Detail hub with comments + grid | `/ng-page` (hub section — pattern from `task-management`) |

Do NOT re-derive grid/form/dialog scaffolding here — always delegate.

---

## Rules

1. **Always reuse shared-ui.** Before writing any component, check `@backoffice/shared-ui` public API — `bo-action-buttons-panel`, `bo-grid`, `bo-details-panel`, `bo-search-dropdown`, `bo-tabber`, `bo-progress-bar`, `bo-slide-toggle`, `bo-counter`, `bo-base-dialog`, `bo-configurable-dialog`, etc.
2. **Delegate** to `/ng-page`, `/ng-grid`, `/ng-dialog`, `/ng-component` — don't inline their scaffolding.
3. **Route registration is NOT optional.** Every new page gets BOTH `apps/task-list/<slug>` → redirect AND the short `<slug>` path, gated by `permissionGuard(PermissionConstants.xxx, false)`, with `title`, `data.menuType`, and only the `resolve` entries the page consumes.
4. **Angular 20 conventions**: no `standalone: true`, `OnPush`, `inject()`, signals, `takeUntilDestroyed(destroyRef)`, Angular 17+ control flow, `styleUrl` singular.
5. **No constructor injection** anywhere.
6. **Pages render inside the existing `bo-layout`** — do not add another layout wrapper.
7. **SCSS tokens**, not raw hex. **Text via `MessageService`**, not hardcoded. **Dates via `SettingHelperService.getDate()` + `customDateUtc` pipe**, never hardcoded formats.
8. **Keep the page component under ~1000 lines** — hoist helpers into sibling services (`<name>-services/`) if it grows.
9. **Flag missing endpoints / permission codes** in the report rather than silently faking production paths.
10. **Generic widgets** (no task-list knowledge) belong in `backoffice-shared-ui` — per CLAUDE.md §4a, ask the developer before placing ambiguous cases.
