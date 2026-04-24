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
  `vendor/backoffice-shared-ui/` (branch: `Staging`). The sandbox
  tsconfig aliases `@backoffice/shared-ui` to the submodule's `public-api.ts`.
- **SCSS tokens:** Use `@use 'variables' as *;` in any page SCSS.
- **Layout:** `app-sandbox-layout` is already mounted at the app root.
  Do **not** wrap new pages in another layout.
- **Navigation:** the left side nav auto-populates from `app.routes.ts`.

## Where you can and cannot edit

**You may write/edit:**
- `src/app/pages/**` — new page folders
- `src/app/app.routes.ts` — add route entries for new pages
- `src/app/core/constants/permission.constants.ts` — add new `PermissionConstants` entries
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

| Skill | Use when |
|---|---|
| `/apply-code-design` | User describes a page in plain text |
| `/apply-figma-design` | User provides a Figma URL |
| `/ng-page` | Scaffold a new page (grid / form / hub shell) |
| `/ng-grid` | Add or wire up a `bo-grid` with filters |
| `/ng-dialog` | Confirm / form / picker dialog |
| `/ng-component` | Reusable widget (page-local vs shared-ui placement) |
| `/review-conventions` | Audit a change against project rules |

## Angular 20 conventions (non-negotiable)

- No `standalone: true` — it's the Angular 20 default.
- `ChangeDetectionStrategy.OnPush` on every component.
- `inject()` for DI — never constructor injection.
- `signal` / `computed` / `input()` / `output()` / `viewChild()` for state.
- `takeUntilDestroyed(destroyRef)` for RxJS teardown.
- Angular 17+ control flow only: `@if`, `@for`, `@switch`.
- `styleUrl` (singular), never `styleUrls`.
- `ReactiveFormsModule` + `inject(FormBuilder)` for forms.

## Shared-ui cheat sheet

| Intent | Use |
|---|---|
| Page title bar + action buttons | `bo-action-buttons-panel` |
| Data table with filters | `bo-grid` + `bo-grid-cell` (delegate to `/ng-grid`) |
| Details / edit form | `bo-details-panel` + `FieldConfig[]` |
| Tabs | `bo-tabber` |
| Search dropdown | `bo-search-dropdown` |
| Toggle | `bo-slide-toggle` |
| Progress | `bo-progress-bar` / `bo-stacked-progress-bar` |
| Modal confirmation | `BaseDialog` |
| Modal with a form | `ConfigurableDialog` + `ConfigurableDialogService` |
| Picker | `BaseSelectEntityDialog` / `MultipleSelectEntityDialog` |
| Sort dialog | `GenericSortDialog` |
| Counter | `bo-counter` |
| Info tooltip | `bo-info-tooltip` |
| Date / time input | `bo-date-picker`, `bo-time-picker` |

## Styling

- `@use 'variables' as *;` at the top of every page SCSS.
- Only use SCSS tokens; no raw hex where a token exists.
- `::ng-deep` is a last resort for reaching into shared-ui internals.

## Reporting back

At the end of a page generation run, summarise:

- Files created / modified.
- Route path to exercise (shows up in the left nav).
- Mock data used.
- Follow-ups: missing endpoints, permission codes needing confirmation,
  strings needing i18n keys, shared-ui gaps.
