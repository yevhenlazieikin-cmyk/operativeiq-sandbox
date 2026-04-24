# OperativeIQ Sandbox — Claude Guide

You are working inside the **OperativeIQ sandbox**, a local Angular 20
project used by product owners to prototype new pages. The app is rendered
live inside an Electron preview pane while you edit files here; every save
triggers `ng serve` HMR, so visual changes show up in seconds.

The sandbox is **not** the production frontend. It exists to prove out
designs quickly. Code you write here is expected to be copy-pasted (or
lightly adapted) into a real task-list-fe-style app later, so match real
task-list-fe conventions — same component library, same shape of pages,
same permission/routing idioms.

## Project orientation

- **Framework:** Angular ^20.3.4, TypeScript ~5.9.2, standalone APIs, signals.
- **Component library:** `@backoffice/shared-ui` is available. Its sources
  travel with the repo as a git submodule at
  `sandbox/vendor/backoffice-shared-ui/` (branch: `Staging`). The sandbox
  tsconfig aliases `@backoffice/shared-ui` → submodule's `public-api.ts`,
  so `import { ActionButtonsPanel, … } from '@backoffice/shared-ui';`
  works with no extra setup.
- **SCSS tokens:** included via `stylePreprocessorOptions.includePaths`.
  Use `@use 'variables' as *;` in any page SCSS to access `$white`,
  `$primary-blue`, `$forest-green`, `$error-red`, `$font-base2`,
  `$font-semibold`, etc.
- **Layout:** `app-sandbox-layout` is already mounted at the app root with
  a `<router-outlet />` inside. Do **not** wrap new pages in another layout.
- **Navigation:** the left side nav auto-populates from `app.routes.ts`, so
  every new route shows up in the preview without extra work.

## Where you can and cannot edit

Enforced by `.claude/settings.json`, reiterated here:

**You may write/edit:**
- `src/app/pages/**` — new page folders
- `src/app/app.routes.ts` — add route entries for new pages
- `src/app/core/constants/permission.constants.ts` — add new
  `PermissionConstants` entries
- `src/app/__mocks__/**` — mock JSON fixtures for new pages

**You may NOT touch:**
- `src/app/layout/**`, `src/app/core/guards/**`, `src/app/core/resolvers/**`,
  `src/app/core/services/**` — sandbox infrastructure
- `src/main.ts`, `src/index.html`, `src/styles.scss`, `src/app/app.ts`,
  `src/app/app.config.ts` — app bootstrap
- `package.json`, `angular.json`, `tsconfig*.json` — project config
- `.claude/**`, `CLAUDE.md`, this file
- Never run `npm install`, `npm uninstall`, `rm -rf`, `git push`, or
  `git commit` — they're denied at the permission layer.

## Skills

Invoke via slash command. The full set from `backoffice-shared-ui` is copied
under `.claude/skills/`:

| Skill | Use when |
|---|---|
| `/apply-code-design` | User describes a page in plain text |
| `/apply-figma-design` | User provides a Figma URL |
| `/ng-page` | Scaffold a new page (grid / form / hub shell) |
| `/ng-grid` | Add or wire up a `bo-grid` with filters |
| `/ng-dialog` | Confirm / form / picker dialog |
| `/ng-component` | Reusable widget (page-local vs shared-ui placement) |
| `/review-conventions` | Audit a change against project rules |

`apply-code-design` and `apply-figma-design` delegate to `/ng-page`,
`/ng-grid`, `/ng-dialog`, `/ng-component` — don't duplicate their
scaffolding. `/create-mr` and `/implement-jira-task` are included but
usually not applicable inside the sandbox.

## Workflow when the user asks for a new page

1. Decide which top-level skill applies (code description vs Figma URL)
   and invoke it with the user's arguments.
2. The skill will delegate to `/ng-page` for shell scaffolding, possibly
   `/ng-grid` / `/ng-dialog` / `/ng-component` for specific bodies.
3. Create files **only** under `src/app/pages/<feature>/`:
   ```
   src/app/pages/<feature>/
   ├── <feature>.component.ts
   ├── <feature>.component.html
   ├── <feature>.component.scss
   └── <feature>-service/ (optional)
   ```
4. Register the route in `src/app/app.routes.ts`. In the sandbox the route
   shape is lighter than task-list-fe — no legacy `apps/task-list/<slug>`
   redirect is needed, but still:
   - `permissionGuard(PermissionConstants.xxx, false)` on `canActivate`
   - `title` set for the nav
   - `data: { menuType: 'OPERATION' | 'ADMINISTRATION' }`
   - `resolve:` only the resolvers the page uses — `timeZoneResolver`,
     `supplyRoomResolver`, `unitResolver` from `core/resolvers/`
5. Add the new `PermissionConstants` entry if you invented one. Mark
   anything invented as *needs backend confirmation* when reporting back.
6. For data: read JSON from `src/app/__mocks__/` via `HttpClient` at
   `/assets/data/<file>` or inline via `import ... from '@mocks/...json'`.
   Never hardcode real URLs; real endpoints are out of scope here.
7. Run `npx tsc --noEmit` (or trust HMR + the preview pane). If a build
   fails, fix it up to 3 attempts; if still broken, leave a clear TODO
   and report the blocker.

## Angular 20 conventions (non-negotiable)

- No `standalone: true` — it's the Angular 20 default.
- `ChangeDetectionStrategy.OnPush` on every component.
- `inject()` for DI — never constructor injection.
- `signal` / `computed` / `input()` / `output()` / `viewChild()` for state.
- `takeUntilDestroyed(destroyRef)` for RxJS teardown — no manual
  `ReplaySubject`, no `ngOnDestroy` unless strictly needed.
- Angular 17+ control flow only: `@if`, `@for`, `@switch`.
- `styleUrl` (singular), never `styleUrls`.
- `ReactiveFormsModule` + `inject(FormBuilder)` for forms; `FormsModule`
  only when a shared widget demands `ngModel` (e.g. `bo-slide-toggle`).

## Shared-ui cheat sheet (used by `/apply-*-design`)

| Figma / intent | Use |
|---|---|
| Page title bar + action buttons | `bo-action-buttons-panel` (import: `ActionButtonsPanel`, buttons: `ActionButton[]`) |
| Data table with filters | `bo-grid` (`GridModule`) — delegate wiring to `/ng-grid` |
| Details / edit form | `bo-details-panel` + `FieldConfig[]` |
| Tabs | `bo-tabber` |
| Search dropdown | `bo-search-dropdown` |
| Toggle | `bo-slide-toggle` |
| Progress | `bo-progress-bar` / `bo-stacked-progress-bar` |
| Modal confirmation | `BaseDialog` (`panelClass: 'small-dialog'` or `'medium-dialog'`) |
| Modal with a form | `ConfigurableDialog` + `ConfigurableDialogService` |
| Picker | `BaseSelectEntityDialog` / `MultipleSelectEntityDialog` |
| Sort dialog | `GenericSortDialog` |
| Counter | `bo-counter` |
| Info tooltip | `bo-info-tooltip` |
| Date / time input | `bo-date-picker`, `bo-time-picker` (or `FieldType.DatePicker` / `TimePicker` inside a details panel) |

Always check `@backoffice/shared-ui`'s public API before writing custom
markup. If a Figma region looks generic and shared-ui doesn't have it,
flag it — don't silently reimplement.

## Styling

- `@use 'variables' as *;` at the top of every page SCSS.
- Only use SCSS tokens; no raw hex where a token exists. If you need a
  new token, flag it — don't invent one inline.
- `::ng-deep` is a last resort for reaching into shared-ui internals.
- `menuType.operation` / `menuType.administration` on
  `bo-action-buttons-panel` already paints the header colour scheme —
  don't override it in page CSS.

## User-facing text

- Inline page titles and button labels → literal strings are fine.
- Validation messages, confirmations, toasts, dialog bodies →
  `MessageService.get('CODE')` with the code added to
  `src/assets/data/messages.json`. Never hardcode those.

## When you hit something you can't do

- Backend endpoint missing → use `of(mockData)` from a mock fixture,
  leave a `TODO:` comment with context.
- Permission code unknown → propose `oi_<slug>_view` /
  `oi_<slug>_manage` and call out `needs backend confirmation` in the
  report-back.
- Shared-ui component gap → flag it in the report. Don't reimplement
  a one-off locally.

## Reporting back

At the end of a page generation run, summarise:

- Files created / modified.
- Route path to exercise (shows up in the left nav).
- Mock data used.
- Follow-ups: missing endpoints, permission codes needing confirmation,
  strings needing i18n keys, shared-ui gaps.

Keep it tight — the user is watching the live preview as you work.
