---
name: review-conventions
description: Review changed files in task-list-fe against CLAUDE.md conventions and Angular 20 best practices
user-invocable: true
argument-hint: File path or glob pattern (optional, defaults to uncommitted changes)
---

Review code for violations of project conventions defined in `CLAUDE.md` (Angular 20, `@backoffice/shared-ui`, task-list-fe folder layout).

If $ARGUMENTS is provided, review those specific files. Otherwise, review all uncommitted changes:

- Run `git diff --name-only` and `git diff --cached --name-only` to find changed files.
- Exclude any paths under `backoffice-shared-ui/` unless the user explicitly asks for them — that's a separate submodule repo with its own conventions.
- Read each changed file and check against the sections below.

---

## Checks

### Angular 20 component architecture (CRITICAL)

- [ ] **NO `standalone: true`** — it's the default in Angular 20 and linting may flag it.
- [ ] `changeDetection: ChangeDetectionStrategy.OnPush` on every new component.
- [ ] `styleUrl` (singular) — not `styleUrls: [...]`.
- [ ] `@Component({ ..., imports: [...] })` lists only what the template actually uses.
- [ ] Selector prefix: `app-` for page-local, `bo-` for `backoffice-shared-ui` components.

### Angular control flow (CRITICAL)

- [ ] No `*ngIf`, `*ngFor`, `*ngSwitch` in new code — must use `@if`, `@for`, `@switch`.
- [ ] `@for` has `track` expression (prefer `item.id`; `$index` only as last resort).

### Dependency injection

- [ ] All DI via `inject()` — no constructor injection (including HTTP services).
- [ ] Services `@Injectable({ providedIn: 'root' })`; page-local services live inside the page folder (`<name>-service/`), shared ones in `src/app/core/services/`.

### Reactive state & subscription cleanup (CRITICAL)

- [ ] Use `takeUntilDestroyed(this.destroyRef)` for RxJS subscription cleanup — **NOT** `ReplaySubject<void>(1)` + `takeUntil(this._destroy$)`. The project has standardised on `DestroyRef`.
- [ ] Angular signals (`signal`, `computed`, `input`, `output`, `toSignal`) for local reactive state — prefer over `BehaviorSubject` for new UI state.
- [ ] No `.subscribe()` without cleanup. Async pipe preferred for template consumption.
- [ ] No nested subscriptions — use `switchMap`, `mergeMap`, `forkJoin`, `combineLatest`.

### Shared-ui reuse — no reinvention

Check `@backoffice/shared-ui` public API before adding any new markup:

- [ ] Page header → `<bo-action-buttons-panel [state]="menuType.operation | administration">` (NOT hand-rolled).
- [ ] Data grid → `<bo-grid>` + `<bo-grid-cell>` content projection. Not raw `mat-table`, `mat-grid`, or custom tables.
- [ ] Two-panel / details form → `<bo-details-panel>` driven by `FieldConfig[]`. Not hand-rolled form markup.
- [ ] Confirm dialog → `BaseDialog`. Form dialog → `ConfigurableDialog` (via `ConfigurableDialogService`). Pickers → `BaseSelectEntityDialog`, `MultipleSelectEntityDialog`, `GenericSortDialog`.
- [ ] Dropdowns → `<bo-search-dropdown>`. Tabs → `<bo-tabber>`. Toggle → `<bo-slide-toggle>`. Progress → `<bo-progress-bar>` / `<bo-stacked-progress-bar>`.
- [ ] Counter / tooltip / date / time → `<bo-counter>` / `<bo-info-tooltip>` / `<bo-date-picker>` / `<bo-time-picker>`.
- [ ] Icons → `<bo-svg-icon name="camelCaseKey" />`. NOT inline SVG, NOT `mat-icon`.
- [ ] Global loader already mounted in `app.html` — control via `LoaderService.show()` / `.hide()`.
- [ ] Generic widgets with no task-list domain knowledge belong in `backoffice-shared-ui` (submodule PR) — per CLAUDE.md §4a. Flag any generic widget added locally.

### Page layout

- [ ] Pages render **inside** the existing `<bo-layout>` + `<router-outlet>` in `src/app/app.html`. No second `bo-layout` / custom shell.
- [ ] Grid wrappers use `<div class="table-wrapper pd-big tbl-shadow mb-0" appStickyHeaderGroup>` (or equivalent standard wrapper from task-list-summary).
- [ ] Form pages use `<div class="double-column-layout">` wrapper for two `bo-details-panel` columns.

### Routing & permissions (CRITICAL)

- [ ] Routes in `src/app/app.routes.ts` use `loadComponent` (lazy) — never `loadChildren` for a single page.
- [ ] Every new route has BOTH the short path AND the legacy `apps/task-list/<slug>` redirect.
- [ ] Every route has `canActivate: [permissionGuard(PermissionConstants.xxx, false)]` (second arg `true` only if another guard already called `PermissionDataService.refreshIfStale()`).
- [ ] Route has `title` and `data: { menuType: 'OPERATION' | 'ADMINISTRATION' }`.
- [ ] Permission entries added to `src/app/core/constants/permission.constants.ts` (not inline literals in the guard — except intentional multi-code cases).
- [ ] Template-level gating uses `*hasAccess="PermissionConstants.xxx"`; programmatic via `ManagePermissionService.hasAccess(...)`.

### HTTP services

- [ ] `@Injectable({ providedIn: 'root' })`, thin (transport + spinner only).
- [ ] `LoaderService.show()` before request; `.pipe(finalize(() => this._loaderService.hide()))` after.
- [ ] URLs built from `${environment.CLIENT_API}/…`. **No hardcoded URLs.**
- [ ] Auth / network interceptors not re-implemented (already wired at bootstrap).

### Forms

- [ ] `ReactiveFormsModule` + `inject(FormBuilder)`. `FormsModule` + `ngModel` only when a shared widget requires it (e.g. `bo-slide-toggle`).
- [ ] Details forms use `FieldConfig[]` + `bo-details-panel`. Avoid building custom `.form-row` markup unless the shared-ui flow genuinely can't express the layout.
- [ ] `validationStrategy: 'submit'` for business fields inside `FieldConfig`.
- [ ] Header buttons (`Back / Save / Apply / Publish / Copy`) built as a computed `ActionButton[]` getter reading signals, not static arrays.

### SCSS & styling

- [ ] Files import `@use 'variables' as *;` — `includePaths` already configured, so shared tokens resolve.
- [ ] Colours use shared tokens (`$white`, `$error-red`, `$forest-green`, `$ocean-blue`, …) — not raw hex where a token exists.
- [ ] Typography uses shared tokens (`$font-base2`, `$font-semibold`, …) — no inline `font-family` overrides.
- [ ] `::ng-deep` only as a last resort to reach into shared-ui components.
- [ ] Component classes are namespaced; no bare selectors like `.row { ... }` at component root.

### User-facing text

- [ ] Validation messages, toast notifications, dialog bodies → `MessageService.get('CODE')` with entries in `src/assets/data/messages.json`. **Not hardcoded.**
- [ ] Page titles / static button labels can remain literal.

### Dates & timezones

- [ ] Date formatting strings from `SettingHelperService.getDate()` (`formatPipe`, `formatPipeDateTime`). **No hardcoded `'MM/dd/yyyy'`** etc.
- [ ] UTC values rendered via `| customDateUtc: format : tzone?.Iana_TimeZoneName`.
- [ ] Timezone resolution via `DataHelperService.setStaticUnitTimeZone` / `setStaticSupplyRoomTimeZone` / `setStaticDefaultTimeZone`.

### Grid-specific

- [ ] `filterData.filterHeader` is a unique storage key (convention: `grid_filter_<PageName>`).
- [ ] `GridFilterStorage.storeOrRestoreFilter` called on row click / navigation; `getActiveFilter` in `ngOnInit` to restore.
- [ ] `GridCustomizationService.getGridCustomization` → `applyGridCustomization` → `loadData` flow on init; setup dialog via `openSetupColumnsDialog` with a `columnLabelMap`.
- [ ] Rows tracked by stable id (`track row.id`), never `$index` alone.
- [ ] `gridType: 'CLIENT'` + `clientGridPagination: true` for client-side lists.
- [ ] Renamed filter `name`? There's a `migrate` function in `storeOrRestoreFilter`.

### Dialogs

- [ ] `disableClose: true` and `autoFocus: false` for pickers.
- [ ] `panelClass` chosen from the sanctioned set: `configurable-dialog-panel`, `small-dialog`, `medium-dialog`, `large-dialog`.
- [ ] `ConfigurableDialog` opened via `ConfigurableDialogService` unless you need non-default MatDialog config.
- [ ] Select-entity dialogs wrapped in a `*DialogService` when reused across pages (pattern from `DivisionDialogService`).

### Naming & files

- [ ] Components: `app-<name>` (page-local) / `bo-<name>` (shared-ui), kebab-case selector.
- [ ] File names kebab-case; class names PascalCase with `Component` / `Service` / `Directive` / `Pipe` suffix.
- [ ] Pages live under `src/app/pages/<name>/`; page-local services under `<name>-service/`; interfaces in `<name>.interface.ts`; schemas in `<name>.schema.ts`.
- [ ] Cross-cutting code under `src/app/core/` (constants, directives, guards, interceptors, models, resolvers, services, validators).
- [ ] Page component `.ts` under ~1000 lines; hoist helpers into sibling `*-services/` folders when it grows.

### Security

- [ ] No `innerHTML` / `[innerHTML]` without a sanitising pipe.
- [ ] No hardcoded API URLs — always `environment.CLIENT_API`.
- [ ] No sensitive info in logs / dev-only debug left behind.

### Assets & icons

- [ ] New SVG icons dropped in `src/assets/images/icon/` and included via `npm run sprites`. NOT hand-rolled inline SVG in templates.
- [ ] Icon keys **camelCase** (e.g. `arrowLeftSlider`), not kebab-case in the template lookup.

### Submodule hygiene

- [ ] No silent edits to files under `backoffice-shared-ui/`. Changes there need their own branch + PR on the submodule repo.
- [ ] If `git status` shows `M backoffice-shared-ui`, flag it — this is a submodule pointer move and usually belongs in a separate PR.

---

## Output format

Report findings as:

```
## Convention Review: <file list>

### Violations Found
1. **[CRITICAL]** `file:line` — <description> → <fix>
2. **[WARNING]** `file:line` — <description> → <fix>

### Passed Checks
- All control flow uses @if / @for / @switch
- Proper inject() usage
- bo-action-buttons-panel used for page header
- Subscriptions cleaned up via takeUntilDestroyed
- …

### Summary
X violations found (Y critical, Z warnings)
```

Severity guide:

- **CRITICAL** — will break builds, conflict with project patterns, bypass permission gating, leak secrets, or violate Angular 20 defaults (e.g. `standalone: true` set, constructor injection, `*ngIf` in new code, hardcoded URL, missing legacy `apps/task-list/<slug>` redirect, `ReplaySubject<void>(1)` instead of `takeUntilDestroyed`).
- **WARNING** — style deviation, raw hex where a token exists, missing `validationStrategy: 'submit'`, oversized component file, inline SVG instead of `bo-svg-icon`, etc.
