---
name: apply-figma-design
description: Implement Angular 20 code in task-list-fe from a Figma design URL using project conventions and backoffice-shared-ui components
user-invocable: true
argument-hint: Figma URL | Additional instructions (optional)
allowed-tools: mcp__figma__get_design_context mcp__figma__get_screenshot mcp__figma__get_metadata mcp__figma__search_design_system Read Glob Grep Edit Write Bash(npm start) Bash(npm run lint:all) Bash(npm run lint:all:fix) Bash(npx tsc --noEmit)
---

Parse $ARGUMENTS to extract:

- **[url]** (REQUIRED): Figma design URL — `figma.com/design/:fileKey/:fileName?node-id=:nodeId` (or with a `branch/:branchKey/` segment).
- **[instructions]**: free-form text after the URL. Takes priority over inferred decisions (e.g. "this is the grid layout for units", "OPERATION page", "delegate drawer to ng-dialog", "mock data only").

If `[url]` is missing or the nodeId cannot be extracted, **stop and ask the user** for a valid Figma link.

---

## Workflow

### Step 1 — Extract design context from Figma

Parse the URL:

- `figma.com/design/:fileKey/:fileName?node-id=:nodeId` → **convert `-` to `:` in nodeId** (Figma URLs encode the separator as `-`).
- `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use `branchKey` as `fileKey`.

Call `mcp__figma__get_design_context` with `fileKey` and `nodeId`. It returns React+Tailwind reference code, a screenshot, and hints (Code Connect mappings, design tokens, annotations). Treat this output as a **reference**, not final code — you must re-express it in task-list-fe's stack.

If useful, also call:
- `mcp__figma__get_screenshot` — pixel-level reference for tricky spacing / alignment.
- `mcp__figma__get_metadata` — node hierarchy, useful to map sections to existing shared components.
- `mcp__figma__search_design_system` — find a matching shared-ui primitive before writing custom markup.

### Step 2 — Analyze the design

From the Figma output, determine:

1. **Scope** — full page vs. reusable widget.
   - Full page → delegate to `/ng-page` + `/apply-code-design` planning flow.
   - Reusable widget → delegate to `/ng-component` (page-local vs shared-ui per CLAUDE.md §4a).
2. **Page kind** (if it's a page):
   - List/table with filters → `grid` kind → delegate to `/ng-grid`.
   - Two-panel details/edit form → `form` kind (`bo-details-panel` + `FieldConfig[]`).
   - Hybrid (details + grid + comments/history) → `hub` kind (pattern from `task-management`).
3. **Menu type** — use `OPERATION` for operation-flow pages, `ADMINISTRATION` for setup/admin. If Figma shows the existing app header, the header colour tells you which one.
4. **Reusable shared-ui pieces** — map Figma sections to `@backoffice/shared-ui` components BEFORE generating custom markup:
   - Header with title + action buttons → `bo-action-buttons-panel` (+ `bo-action-button-sub-panel` for an inner row)
   - Table / list → `bo-grid` (+ `bo-grid-cell` content projection)
   - Form → `bo-details-panel` + `FieldConfig[]`
   - Tabs → `bo-tabber`
   - Dropdown search → `bo-search-dropdown`
   - Toggle → `bo-slide-toggle`
   - Progress → `bo-progress-bar` / `bo-stacked-progress-bar`
   - Confirm dialog → `bo-base-dialog` (via `BaseDialog` + `MatDialog`)
   - Form dialog → `bo-configurable-dialog` (`ConfigurableDialog` + `ConfigurableDialogService`)
   - Select picker → `BaseSelectEntityDialog` / `MultipleSelectEntityDialog` / `GenericSortDialog`
   - Date / time → `bo-date-picker` / `bo-time-picker` (or `FieldType.DatePicker` / `TimePicker` inside a details panel)
   - Counter → `bo-counter`
   - Tooltip → `bo-info-tooltip`
5. **Design tokens** — map Figma values to project SCSS tokens from `@use 'variables' as *`:
   - Common: `$white`, `$error-red`, `$forest-green`, `$ocean-blue`, `$font-base2`, `$font-semibold`.
   - Do NOT bake raw hex. If a colour doesn't have a matching token, raise it before adding a one-off.
6. **Design-system annotations** — follow any designer notes (padding constraints, motion specs, a11y callouts). If the Figma response includes Code Connect snippets, use the mapped component directly.

### Step 3 — Plan and confirm

Before writing code, produce a short structured plan in chat:

- **Scope**: page / component, target folder.
- **Kind**: `grid` / `form` / `hub` / `component`.
- **Menu type**: `OPERATION` / `ADMINISTRATION`.
- **Shared-ui pieces**: which `bo-*` you'll reuse.
- **New files**: `<name>.component.ts/.html/.scss/.schema.ts/.interface.ts` (+ service folder if a page).
- **Route entry** (for pages): short path + `apps/task-list/<slug>` legacy redirect, permission guard, resolvers.
- **Open decisions**: ambiguous menuType, missing permission code, backend endpoint TBC, shared-ui component gaps.

Apply `[instructions]` verbatim if provided (e.g. user says "use MultipleSelectEntityDialog for the crew picker" → don't second-guess). Wait for explicit user approval before editing files when open decisions remain; proceed directly when the design is unambiguous.

### Step 4 — Generate code

Delegate scaffolding to the right skill — don't duplicate their content here:

- **Page shell** → `/ng-page` with the chosen `[kind]` + `[menuType]`.
- **Grid body** → `/ng-grid` for `FilterData`, `GridCell`, `GridFilterStorage`, `GridCustomizationService` wiring.
- **Dialogs / pickers** → `/ng-dialog` for `BaseDialog`, `ConfigurableDialog`, `BaseSelectEntityDialog`, `MultipleSelectEntityDialog`, `GenericSortDialog`.
- **Reusable widget** → `/ng-component` (check placement per CLAUDE.md §4a: page-local vs shared-ui).

Implementation rules (same as `/apply-code-design`):

- **Do NOT paste raw React/Tailwind** from the Figma context. Re-express as Angular 20 + `@backoffice/shared-ui`.
- Angular 20 defaults: no `standalone: true`, `OnPush`, `styleUrl` singular, `inject()`, signals, `takeUntilDestroyed(destroyRef)`, Angular 17+ control flow (`@if` / `@for` / `@switch`).
- `ReactiveFormsModule` + `inject(FormBuilder)` for forms.
- Pages render **inside** the existing `<bo-layout>` + `<router-outlet>` in `src/app/app.html` — do NOT add a layout wrapper.
- Headers: ALWAYS `<bo-action-buttons-panel [title] [buttons] [state]="menuType.operation | menuType.administration" />` — never hand-rolled markup.
- SCSS: `@use 'variables' as *;` + shared tokens. Reach into shared-ui components with `::ng-deep` only as a last resort.
- Text: validation messages / confirmations / toasts → `MessageService.get('CODE')` with entries in `src/assets/data/messages.json`. Inline page titles / inline button labels can stay as literals.
- Dates: `SettingHelperService.getDate()` + `| customDateUtc: format : tzone?.Iana_TimeZoneName`. Never hardcode `MM/dd/yyyy`.
- Icons: SVG sprite — `<bo-svg-icon name="camelCaseKey" />`. If a new icon is needed, drop the SVG in `src/assets/images/icon/` and run `npm run sprites`.
- SCSS variable `includePaths` from shared-ui are already wired — `$white`, `$error-red`, `$forest-green`, `$ocean-blue`, etc. resolve without extra config.

### Step 5 — Permission & routing

Even when the design doesn't show them, every new page needs:

1. `PermissionConstants` entry in `src/app/core/constants/permission.constants.ts` (propose `oi_<name>_view` / `oi_<name>_manage` if not specified).
2. Two route entries in `src/app/app.routes.ts`: `apps/task-list/<slug>` → redirect to `<slug>`, and the `<slug>` loadComponent with `permissionGuard(PermissionConstants.xxx, false)`, `title`, `data.menuType`, and only the `resolve` entries the page consumes.

If permission codes are guessed, flag them as *needs backend confirmation* in the report-back.

### Step 6 — Verify

1. `npx tsc --noEmit` — compiles.
2. `npm run lint:all` — passes (fix with `npm run lint:all:fix`).
3. Compare the rendered page against the Figma screenshot — spacing, colour, typography, ordering. The screenshot is the source of truth for visuals.
4. Walk through the golden interaction (click the list row, open the dialog, submit the form) in the browser at `http://localhost:4200/<slug>`.
5. Report back:
   - Figma node + fileKey used.
   - Created / modified files.
   - Route path(s) + permission codes (mark if backend-pending).
   - Any shared-ui gaps you discovered (component missing from `@backoffice/shared-ui` that would belong there — flag for a separate submodule PR).
   - Follow-ups: mock data used, backend endpoints still required, messages needing i18n keys.

---

## Mapping Figma hints to shared-ui — cheat-sheet

| Figma section | Use |
|---|---|
| Page title bar with primary/secondary buttons | `bo-action-buttons-panel` |
| Secondary action strip inside a panel | `bo-action-button-sub-panel` via `customMiddleTemplate` on `bo-grid` |
| Tabs | `bo-tabber` |
| Data table with filter row | `bo-grid` + `bo-grid-cell` (`gridType: 'CLIENT'` + `clientGridPagination`) |
| Left/right two-column form | `<div class="double-column-layout">` + two `bo-details-panel` |
| Form field (text, select, checkbox, date, etc.) | `FieldConfig[]` with `FieldType.*` inside `bo-details-panel` |
| Search dropdown | `bo-search-dropdown` |
| Modal confirmation | `BaseDialog` (panelClass: `small-dialog` or `medium-dialog`) |
| Modal with form | `ConfigurableDialog` via `ConfigurableDialogService` |
| Picker with a grid of choices | `BaseSelectEntityDialog` (single) / `MultipleSelectEntityDialog` (multi) |
| Drag-to-sort list | `GenericSortDialog` |
| Progress bar / stacked bars | `bo-progress-bar` / `bo-stacked-progress-bar` |
| On/off toggle | `bo-slide-toggle` (needs `FormsModule` + `ngModel`) |
| +/- counter | `bo-counter` |
| Info "i" tooltip | `bo-info-tooltip` |
| Date / time input | `bo-date-picker` / `bo-time-picker` (or `FieldType.DatePicker`/`TimePicker`) |
| Inline loader | `LoaderService.show()` / `.hide()` (global spinner is mounted in `app.html`) |

If the Figma design shows a clearly generic widget with no task-list domain knowledge and shared-ui doesn't already have it, add it to `backoffice-shared-ui` (separate submodule PR) — per CLAUDE.md §4a, ask first when ambiguous.

---

## Rules

1. **Always call `get_design_context` first** — don't try to guess the design from the URL alone.
2. **Figma output is a reference, not final code.** Re-express as Angular 20 + `@backoffice/shared-ui`; never commit raw React/Tailwind snippets.
3. **Check shared-ui before writing markup.** Every Figma section should first be matched to an existing `bo-*` component.
4. **Delegate** to `/ng-page`, `/ng-grid`, `/ng-dialog`, `/ng-component` for scaffolding. Apply Figma-specific visual adjustments (spacing, tokens) on top.
5. **Angular 20 conventions** non-negotiable: no `standalone: true`, `OnPush`, `inject()`, signals, `takeUntilDestroyed`, `styleUrl` singular, Angular 17+ control flow.
6. **Route registration** is part of the job: add both `apps/task-list/<slug>` redirect AND the short path with `permissionGuard`, `title`, `data.menuType`, resolvers.
7. **Map design tokens to SCSS variables.** No raw hex where a token exists; flag new tokens for a shared-ui PR.
8. **User-facing strings** via `MessageService` + `messages.json` — not inline for validation/toasts/dialog bodies.
9. **Flag gaps** — missing shared-ui primitive, missing backend endpoint, permission code needing backend confirmation — in the report rather than silently faking.
10. **Do not** introduce new state containers (NgRx/Akita). Signals + RxJS + `SharedCommunication` cover the current needs.
