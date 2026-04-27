---
name: ng-page
description: Create a new Angular 20 page with lazy-loaded route, permissionGuard, menuType, and bo-action-buttons-panel header
user-invocable: true
argument-hint: Page name | Page kind (grid|form|hub) | Menu type (OPERATION|ADMINISTRATION) | Permission code | Summary
---

Parse $ARGUMENTS to extract:

- **[name]**: kebab-case path segment AND folder name (e.g. `unit-inspections`). Derive PascalCase class name (e.g. `UnitInspectionsComponent`).
- **[kind]**: page variant:
  - `grid` — list/table page with `bo-grid`, `FilterData`, `GridCustomizationService` (see `/ng-grid`)
  - `form` — details/edit page with `bo-details-panel` driven by `FieldConfig[]`
  - `hub` — hybrid page (details panel + comments + embedded grid + history)
- **[menuType]**: `OPERATION` or `ADMINISTRATION` — controls header / colour scheme.
- **[permission]**: name of the `PermissionConstants` entry (e.g. `taskListManagementView`). If it doesn't exist yet, add it in step 2.
- **[summary]**: what the page does.

## Page structure

Every page lives under `src/app/pages/<name>/`:

```
src/app/pages/<name>/
├── <name>.component.ts
├── <name>.component.html
├── <name>.component.scss
├── <name>.schema.ts            # grid pages: FilterData + cellSchema; form pages: form builder + FieldConfig[]
├── <name>.interface.ts         # view models / DTOs consumed by the page
└── <name>-service/
    ├── <name>.service.ts       # HTTP facade (providedIn: 'root', uses LoaderService)
    └── <name>.interface.ts     # request/response shapes
```

The root shell (`<bo-layout>` + `<router-outlet>` + `<lib-loader>`) is already mounted in the app root component. Pages render **inside** the outlet — do **not** add another `bo-layout`.

## Workflow

### Step 1 — Scaffold the folder

Create the files above. Services/interfaces for the page stay inside its folder; lift to `core/services/` only when a second page needs them.

### Step 2 — Define the permission

1. Confirm the page code(s) exist in the backend permission catalogue.
2. Add to the project's permission constants file (typically `src/app/core/constants/permission.constants.ts`):
   ```typescript
   export const PermissionConstants = {
     ...,
     myPageView:   { PageCodes: ['oi_my_page_view'] },
     myPageManage: { PageCodes: ['oi_my_page_manage'] }
   };
   ```
3. If a page must allow access via **any of multiple codes** (e.g. manager OR owner-only views), pass a literal context inline at the guard:
   ```typescript
   canActivate: [permissionGuard({ PageCodes: ['code_a', 'code_b'] }, false)]
   ```

### Step 3 — Register the route

Edit the project's route file (typically `src/app/app.routes.ts`). Check CLAUDE.md for the project's **legacy route prefix** (e.g. `apps/task-list/`, `apps/checksheet/`, etc.) and add BOTH the new short path AND the legacy redirect so the host shell keeps working:

```typescript
{
  path: '<legacy-prefix>/my-page',
  redirectTo: 'my-page'
},
{
  path: 'my-page',
  loadComponent: () =>
    import('./pages/my-page/my-page.component').then(c => c.MyPageComponent),
  canActivate: [permissionGuard(PermissionConstants.myPageView, false)],
  title: 'My Page',
  data: { menuType: 'OPERATION' },   // or 'ADMINISTRATION'
  resolve: {                         // only what you actually consume
    timeZones: timeZoneResolver,
    supplyRooms: supplyRoomResolver,
    units: unitResolver
  }
}
```

For an edit route with an id, follow the `manage/:id` pattern from existing edit pages in the project:

```typescript
{ path: 'my-page/manage',     ...loadComponent(MyPageManageComponent), title: 'New My Item',  canActivate: [permissionGuard(PermissionConstants.myPageManage, false)] },
{ path: 'my-page/manage/:id', ...loadComponent(MyPageManageComponent), title: 'Edit My Item', canActivate: [permissionGuard(PermissionConstants.myPageManage, false)] }
```

Pass `skipUpdatePerm = true` (second arg of `permissionGuard`) only if another guard in the same navigation already ran `PermissionDataService.refreshIfStale()`.

### Step 4 — Component skeleton (all kinds share this base)

```typescript
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit,
  signal, TemplateRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ActionButtonsPanel } from '@backoffice/shared-ui';
import { menuType } from '@backoffice/shared-ui/lib/header/menu-type.enum';
import { ActionButton } from '@backoffice/shared-ui/lib/action-buttons-panel/action-button-panel.interface';

import { MyPageService } from './my-page-service/my-page.service';
import { ManagePermissionService } from '../../core/services/manage-permission/manage-permission';
import { PermissionConstants } from '../../core/constants/permission.constants';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrl: './my-page.component.scss',
  imports: [CommonModule, ActionButtonsPanel],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr       = inject(ChangeDetectorRef);
  private readonly router    = inject(Router);
  private readonly route     = inject(ActivatedRoute);
  private readonly service   = inject(MyPageService);
  private readonly permService = inject(ManagePermissionService);

  public readonly menuType = menuType;
  public readonly pageCode = 'oi_my_page_view';        // used for grid customization keying
  private readonly hasEditAccess =
    this.permService.hasAccess(PermissionConstants.myPageManage);

  public actionButtons: ActionButton[] = this.hasEditAccess
    ? [{ name: 'New', actionCB: () => this.router.navigate(['/my-page/manage']) }]
    : [];

  ngOnInit(): void {
    // data / customization loading (see per-kind sections below)
  }
}
```

Angular 20 reminders:
- Do NOT add `standalone: true` (default).
- Use `styleUrl` (singular).
- `inject()` for DI; `takeUntilDestroyed(this.destroyRef)` for cleanup — no `ReplaySubject<void>(1)`.
- Signals (`signal`, `computed`, `input`, `output`) for reactive state.

### Step 5 — Template shell

Every page opens with `bo-header` and closes with `bo-footer`. The root `<section>` has `margin-top: 40px` for the required gap between the toolbar and `bo-action-buttons-panel`.

```html
<bo-header
  toolbarUrl="/mock/api"
  appUrl="task-list"
  [initialMenuType]="menuType.administration"
  [siteInfo]="siteInfo()"
/>

<section class="<name>">
  <bo-action-buttons-panel
    [title]="'My Page'"
    [buttons]="actionButtons"
    [state]="menuType.operation" />

  <!-- kind-specific body — see per-kind sections -->

  <bo-footer />
</section>
```

Wiring `bo-header` in the component:

1. Import `Header`, `Footer`, `menuType` from `@backoffice/shared-ui`.
2. Import `MenuService` from `@backoffice/shared-ui/lib/header/menu-service/menu-items.service`.
3. Import `SiteInfo` from `@backoffice/shared-ui/lib/header/site-info.interface`.
4. Create `src/app/pages/<name>/mock-menu.service.ts` returning `of(navigationMenu)` from `@mocks/navigation-menu`.
5. Add to `@Component`:
   ```typescript
   imports: [Header, Footer, …],
   providers: [{ provide: MenuService, useClass: MockMenuService }]
   ```
6. Add a `siteInfo` signal:
   ```typescript
   protected readonly siteInfo = signal<SiteInfo>({
     CrewId: 1, CrewName: 'Demo Crew', CompanyName: 'OperativeIQ',
     FooterMessage: '', LastLoginInfo: null
   });
   ```
7. In SCSS: `.<name> { margin-top: 40px; }`.

### Step 6 — Kind-specific body

#### `grid` — list page

Delegate to **`/ng-grid`**. At minimum you need:

```html
<div class="table-wrapper pd-big tbl-shadow mb-0" appStickyHeaderGroup>
  <div class="table">
    <bo-grid
      [(sortedDataStore)]="items"
      [outerService]="true"
      [filtersIncluded]="true"
      [filterData]="filterData"
      [generalView]="true"
      [gridType]="'CLIENT'"
      [clientGridPagination]="true"
      [allowFlexRow]="true">
      @for (row of items(); track row.id; let odd = $odd) {
        <div class="grid-cell-wrapper pd-big mb-0" (click)="onRowClick(row)">
          <div class="table">
            <div class="tr colored-row mob-ribbon-less">
              <bo-grid-cell
                class="grid-cell"
                [ngClass]="{ 'even-row': odd }"
                [row]="row"
                [index]="$index"
                [cellSchema]="cellSchema"
                [filterData]="filterData"
                [selectedRow]="activeRow"></bo-grid-cell>
            </div>
          </div>
        </div>
      }
    </bo-grid>
  </div>
</div>
```

Component wiring checklist (see existing grid pages in the project for full examples):
- `filterData` + `cellSchema` from `<name>.schema.ts`.
- `GridFilterStorage`: call `storeOrRestoreFilter` on row click/navigation, `getActiveFilter` in `ngOnInit` to restore.
- `GridCustomizationService`: call `getGridCustomization(pageCode)` → `applyGridCustomization` → `loadData()`. Open setup via `openSetupColumnsDialog` with a `columnLabelMap`.
- Track rows by a stable ID (`track row.id`) — never `$index` alone.

#### `form` — details/edit page

Two-panel layout driven by `bo-details-panel` + `FieldConfig[]`:

1. In `<name>.schema.ts`, build the form and field configs:
   ```typescript
   import { FormBuilder, FormGroup, Validators } from '@angular/forms';
   import { FieldConfig } from '@backoffice/shared-ui/lib/details-panel/field-config.interface';
   import { FieldType } from '@backoffice/shared-ui/lib/details-panel/field-type.enum';

   export const myForm = (fb: FormBuilder): FormGroup => fb.group({
     name: ['', [Validators.required, Validators.maxLength(50)]],
     description: ['', [Validators.maxLength(255)]],
     type: [null, Validators.required],
     active: [true]
   });

   export const myFieldConfigs = (onTypeSelect: () => void): FieldConfig[] => [
     { label: 'Name:',        type: FieldType.TextField,     formControlName: 'name',        required: true, maxLength: 50, validationStrategy: 'submit' },
     { label: 'Description:', type: FieldType.TextArea,      formControlName: 'description', maxLength: 255 },
     { label: 'Type:',        type: FieldType.SelectEntity,  formControlName: 'type',        required: true, onEntitySelect: onTypeSelect, placeholderLabel: 'Select Type' },
     { label: 'Active:',      type: FieldType.Checkbox,      formControlName: 'active' }
   ];
   ```

2. Template:
   ```html
   <bo-action-buttons-panel
     [title]="pageName()"
     [buttons]="headerButtons"
     [state]="menuType.administration" />

   <div class="double-column-layout">
     <bo-details-panel
       [form]="form"
       [fields]="fieldConfigs()"
       [title]="'Details'" />

     @if (systemInfoForm) {
       <bo-details-panel
         [form]="systemInfoForm"
         [fields]="systemInfoFieldConfigs"
         [title]="'System Information'" />
     }
   </div>
   ```

3. Component imports: `ActionButtonsPanel`, `DetailsPanel`, `ReactiveFormsModule`, `CommonModule`.

4. Use `FieldType` values available on the enum: `ReadOnly`, `ReadOnlyDate`, `TextField`, `NumberField`, `SelectEntity`, `Checkbox`, `InputWithSelect`, `DatePicker`, `TimePicker`, `Radio`, `Select`, `TextArea`, `CustomTemplate`, `FileUploader`, `ImagePreview`.

5. Header buttons (`Back / Save / Apply / Publish / Copy`) should be a computed getter that reads signals (e.g. `isReadOnly()`, `myItemId`) so the UI reflows. See existing edit pages for the pattern.

6. Selection dialogs inside fields:
   - `BaseSelectEntityDialog` — single select.
   - `MultipleSelectEntityDialog` — multi-select with search + ribbon.
   - `GenericSortDialog` — drag-to-sort picker.

7. Preserve cross-navigation state via `SharedCommunication` (set/consume by key) rather than `Router.getCurrentNavigation()`.

#### `hub` — detail hub (rare)

Combines a details panel, an embedded grid, comments, and history in one page. Build it by composing the `form` pattern above with the grid pattern, plus:
- `<bo-comments-panel>` or `<bo-submission-panel>` for comments (imports from `@backoffice/shared-ui`).
- `<bo-expand-collapse-toggle>` for grouping.
- `<bo-quick-filters-panel>` driven by `quickFiltersGroup()` signals.
- Helper services kept in a sibling `<name>-services/` folder to prevent the component from growing past ~1000 lines.

### Step 7 — SCSS

```scss
@use 'variables' as *;

.table-wrapper { background-color: $white; }

// reach into shared components via ::ng-deep only as a last resort
```

### Step 8 — HTTP service

```typescript
// my-page-service/my-page.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '@backoffice/shared-ui';
import { environment } from '../../../../environments/environment';
import { MyItem } from './my-page.interface';

@Injectable({ providedIn: 'root' })
export class MyPageService {
  private readonly _http = inject(HttpClient);
  private readonly _loaderService = inject(LoaderService);

  public getItems(): Observable<MyItem[]> {
    this._loaderService.show();
    return this._http
      .get<MyItem[]>(`${environment.CLIENT_API}/MyEndpoint`)
      .pipe(finalize(() => this._loaderService.hide()));
  }
}
```

- Services are `providedIn: 'root'`, thin (transport + spinner only).
- Never hardcode URLs — always `environment.CLIENT_API`.
- Auth/network interceptors are already wired at bootstrap — don't re-implement.
- Cache shared lookups with `BehaviorSubject` + TTL (see canonical patterns in `core/services/`) only when multiple pages need the same data.

### Step 9 — Verify

1. `npx tsc --noEmit` — compile.
2. `npm run lint:all` — lint (fix with `npm run lint:all:fix`).
3. Open the new route (both short path and legacy redirect path) and confirm:
   - Permission gating fires (no access → redirected to `/`).
   - Header renders with the right menu type.
   - Route resolvers pre-populate lookups.
   - For grid pages: filter/sort/column-setup persist across navigation.

## Rules

1. Pages ALWAYS lazy-load (`loadComponent`); never `loadChildren` a single page.
2. ALWAYS add the legacy redirect (check CLAUDE.md for the project's base path) next to the new short path — the host shell depends on it.
3. Gate every new route with `permissionGuard(PermissionConstants.xxx, false)`.
4. Use `ChangeDetectionStrategy.OnPush`, `inject()`, signals, Angular 17+ control flow.
5. Never re-implement a shared component — check `@backoffice/shared-ui` first (`bo-action-buttons-panel`, `bo-grid`, `bo-details-panel`, `bo-search-dropdown`, `bo-tabber`, `bo-progress-bar`, `bo-slide-toggle`, `bo-base-dialog`, `bo-configurable-dialog`, etc.).
6. Form text (validation messages, notifications, dialog body) lives in the project's messages file via `MessageService.get('CODE')` — never hardcode user-facing text.
7. Use shared SCSS tokens (`$white`, `$error-red`, `$forest-green`, `$ocean-blue`, etc.) via `@use 'variables' as *` — no raw hex where a token exists.
8. Date formatting: pull strings from `SettingHelperService.getDate()` and use `| customDateUtc: dateTimeFormat : tzone?.Iana_TimeZoneName` — never hardcode `MM/dd/yyyy`.
9. Keep the page component under ~1000 lines; hoist helpers into sibling services when it grows.
10. Reusable widgets go to `backoffice-shared-ui` (see `/ng-component` §placement) — ask the developer before creating a file you're unsure about.
