---
name: ng-grid
description: Implement a data grid using bo-grid with content projection, FilterData, GridCell schema, GridFilterStorage, and GridCustomizationService
user-invocable: true
argument-hint: Model name or field list | Grid purpose summary | Options (client|server|collapsed|nested|quick-filters)
---

Parse $ARGUMENTS to extract:

- **[model]**: model/interface name or comma-separated field list.
- **[summary]**: what the grid displays.
- **[options]**: flags — `client` (default, client-side pagination), `server` (OData-backed), `collapsed` (inside `bo-collapsed-grid`), `nested` (sub-rows), `quick-filters` (with `bo-quick-filters-panel`).

If a model is provided, locate it (`src/app/pages/<page>/*.interface.ts` or `core/services/**/*.interface.ts`) and read the field list.

---

## CRITICAL — Content projection pattern

`<bo-grid>` renders rows via **content projection**. It does **not** accept a `cellSchema` input. Never pass cell configuration to `<bo-grid>` itself — you render `@for` + `<bo-grid-cell>` **inside** the grid.

The grid provides:
- Filter/sort bar rendering from `filterData.inputs`
- Client-side filtering/sorting (or server-side via service inputs)
- Infinite scroll / client pagination
- Desktop/mobile layout switching
- Filter clearing coordination

---

## Complete template pattern

### Client-side data (typical task-list-fe page)

```html
<div class="table-wrapper pd-big tbl-shadow mb-0" appStickyHeaderGroup>
  <div class="table">
    <bo-grid
      #gridComponent
      [(sortedDataStore)]="items"
      [outerService]="true"
      [filtersIncluded]="true"
      [filterData]="filterData"
      [generalView]="true"
      [gridType]="'CLIENT'"
      [clientGridPagination]="true"
      [clearAllFilters]="clearAllFiltersEvent"
      [mobileSortingCondition]="false"
      [mobileFilterCondition]="false"
      [allowFlexRow]="true"
      [orderEvent]="orderEvent.asObservable()">
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
                [datePipe]="customDateUTCPipe"
                [selectedRow]="activeRow"></bo-grid-cell>
            </div>
          </div>
        </div>
      }
    </bo-grid>
  </div>
</div>
```

**Key `<bo-grid>` inputs:**

| Input | Value | Purpose |
|---|---|---|
| `[(sortedDataStore)]` | signal getter or array | Two-way — grid sorts/filters this collection |
| `[outerService]="true"` | boolean | Client-side mode — data already in memory |
| `[filtersIncluded]="true"` | boolean | Render the filter/sort header bar |
| `[filterData]` | `FilterData` | Column + filter definitions |
| `[generalView]="true"` | boolean | Same content on desktop and mobile |
| `[gridType]` | `'CLIENT'` \| `'SERVER'` | Pagination mode |
| `[clientGridPagination]` | boolean | Show pager on CLIENT grids |
| `[clearAllFilters]` | `Subject<ClearFilters>` | Parent-driven reset |
| `[mobileSortingCondition]` | boolean | Show mobile sort toggle |
| `[mobileFilterCondition]` | boolean | Show mobile filter toggle |
| `[allowFlexRow]` | boolean | Allow rows to stretch height to content |
| `[orderEvent]` | `Observable<any>` | External sort trigger |

**Key `<bo-grid-cell>` inputs:**

| Input | Purpose |
|---|---|
| `[row]` | Current row object |
| `[index]` | Row position |
| `[cellSchema]` | `GridCell` — cell rendering configuration |
| `[filterData]` | Used to derive column widths from `style.width` |
| `[selectedRow]` | Active-row highlighting (`SelectedRow`) |
| `[datePipe]` | Custom date pipe instance (usually `customDateUTCPipe`) |

### Server-side data (OData)

```html
<bo-grid
  #gridComponent
  [(sortedDataStore)]="items"
  [serviceTitle]="myService"
  [serviceMethod]="'get'"
  [filtersIncluded]="true"
  [filterData]="filterData"
  [gridType]="'SERVER'"
  [infiniteScroll]="true"
  [itemsPerLoad]="50"
  [scrollWindow]="true"
  [customQueryInitial]="'$expand=Category'"
  (sortedDataChange)="onDataChange($event)">
  ...
</bo-grid>
```

| Input | Purpose |
|---|---|
| `[serviceTitle]` | Service instance reference for API calls |
| `[serviceMethod]` | Method name (e.g. `'get'`) |
| `[infiniteScroll]` | Paginated loading via scroll |
| `[itemsPerLoad]` | Items per API request (default 50) |
| `[scrollWindow]` | Window scroll vs container scroll |
| `[customQueryInitial]` | Initial OData fragment (`$expand`, `$filter`) |
| `[customQueryFilter]` | Additional filter fragment |
| `[customQueryEvent]` | Observable of dynamic query changes |

---

## Schema file — `<page>.schema.ts`

```typescript
import { EmsExpireDateIdEnum, FilterFieldTypeEnum, GridCellType, MobGridTileType } from '@backoffice/shared-ui/lib/grid/enum';
import { menuType } from '@backoffice/shared-ui';
import { FilterData, GridCell } from '@backoffice/shared-ui/lib/grid/models';
import { SettingHelperService } from '@backoffice/shared-ui/lib/grid/services/setting-helper.service';

export const myFilterData: FilterData = {
  userMenu: menuType.operation,               // or menuType.administration
  filterHeader: 'grid_filter_MyPage',         // unique storage key — see rules
  sortOptions: {
    default: { key: 'name', direction: 'asc' }
  },
  inputs: [ /* one entry per column */ ],
  mobSearch: '',
  mobSearchPlaceholder: 'Id, Name'
};

export const myCellSchema = (setting: SettingHelperService): GridCell => ({
  mainRow: [ /* one entry per column */ ]
});
```

### `FilterFieldTypeEnum`

| Value | Header control | Use for |
|---|---|---|
| `FilterFieldTypeEnum.Input` | Text input | Text search |
| `FilterFieldTypeEnum.Select` | Dropdown | Category/status filter |
| `FilterFieldTypeEnum.MultiSelect` | Multi-select | Multi-value filter |
| `FilterFieldTypeEnum.Date` | Date picker | Date filter |
| `FilterFieldTypeEnum.DateBase` | Base date select | Date range |
| `FilterFieldTypeEnum.Default` | Label only | Display + sort, no filter control |

### `FilterDataInputs` reference

```typescript
{
  label: 'Column Label',
  type: FilterFieldTypeEnum.Input,
  name: 'fieldName',                         // data property for filter/sort
  value: '',                                 // current filter value
  placeholder: ' ',
  hasSorting: true,
  dataType: 'string',                        // 'multiIds' | 'string' | 'date' | 'number' | 'custom' | 'date-time' | 'exact-match-string' | 'number-as-string'
  options: [{ id: 'a', value: 'A' }],        // Select / MultiSelect
  optionsSortFn: (a, b) => a.value.localeCompare(b.value),
  multiple: true,                            // multi-select mode
  multiIds: true,                            // pair with dataType: 'multiIds'
  hasSearch: true,                           // inline search box in Select dropdown
  clearable: true,                           // show clear button
  style: { width: '12%' },                   // must sum to ~100% across visible columns
  customSortHeading: 'Nested/name',          // sort by a different property (OData expanded)
  customSortDataType: 'string',              // data type for custom sort
  customFilterFunction: (filterValue, rowValue) => true,   // for dataType: 'custom'
  parentFilterFor: 'childField',             // cascade: controls child
  childFilterFor: 'parentField',             // cascade: depends on parent
  childFilterOptions: {
    getSource: (entity) => this.service.getByParent(entity.parentId),
    sourceIdName: 'id',
    sourceName: 'name'
  },
  hiddenColumn: true                         // keep filter logic but hide column (style: { display: 'none', width: '0' })
}
```

### `GridCellType`

| Enum value | Renders | Use for |
|---|---|---|
| `GridCellType.readonlyText` | Plain text | Most columns |
| `GridCellType.readonlyDate` | Formatted date | Date display |
| `GridCellType.editText` | Text input | Editable fields |
| `GridCellType.date` | Date picker | Editable date |
| `GridCellType.counter` | +/- counter | Quantity |
| `GridCellType.checkboxText` | Checkbox + text | Selection rows |
| `GridCellType.imageText` | Image + text | Avatar/image |
| `GridCellType.delete` | Delete button | Row deletion |
| `GridCellType.deleteSubRow` | Delete button | Nested-row deletion |
| `GridCellType.customView` | `TemplateRef` | Complex cell content |
| `GridCellType.conditionalType` | Switches type based on row | Read-only vs editable |
| `GridCellType.dropDown` | Dropdown | In-cell select |
| `GridCellType.empty` | Empty cell | Placeholder |

### `MainRow` cell reference

```typescript
{
  type: GridCellType.readonlyText,
  key: 'fieldName',
  classList: ['semi-bold-font'],
  classCondition: {
    'status-cell':      () => true,
    'status-overdue':   (row) => row.status === 'Overdue',
    'status-completed': (row) => row.status === 'Completed',
    'status-closed':    (row) => row.status === 'Closed'
  },
  mobView: {
    type: MobGridTileType.labelValue,
    mobDef: 'Label',
    order: 2
  },
  // editable cells
  placeholder: 'Enter…',
  changeCB: (value, i, j, row) => this.onChanged(row),
  onFocusOut: (row) => this.onBlur(row),
  disableCondition: (row) => row.isLocked,
  // counter
  maxValue: 99,
  minValue: 0,
  // conditional type
  typeCondition: (row) => row.isReadonly,
  conditionTypes: {
    trueCondition: GridCellType.readonlyText,
    falseCondition: GridCellType.editText
  },
  // custom view
  content: this.customTemplateRef,
  // date
  formatDatePipe: setting.getDate().formatPipe,
  useCustomPipe: true,
  showTimeZone: true,
  // badges
  additionalInfo: [
    { condition: (row) => row.isOverdue, displayText: 'Overdue', classList: ['color-alert'] }
  ],
  tooltipInfo: { message: (row) => row.note, condition: (row) => !!row.note }
}
```

### `MobGridTileType`

| Enum value | Mobile rendering | Use for |
|---|---|---|
| `MobGridTileType.mainTitle` | Large primary text | First/main identifier |
| `MobGridTileType.subTitle` | Smaller secondary | Subtitle under main |
| `MobGridTileType.labelValue` | "Label: Value" pair | Most data columns |
| `MobGridTileType.rightAlignText` | Right-aligned | Dates/amounts on right |
| `MobGridTileType.subRightAlignText` | Right-aligned small | Secondary right-side data |
| `MobGridTileType.editableRow` | Editable input row | Editable fields |
| `MobGridTileType.rowTable` | Table-row layout | Structured rows |
| `MobGridTileType.twoEntities` | Two values side-by-side | Paired values |

Mobile view rules:
- First main-row cell → `MobGridTileType.mainTitle`.
- Subsequent cells → `labelValue` with `mobDef` and an increasing `order`.
- Date cells may use `subRightAlignText` for right-aligned display.

---

## Column-count rule (CRITICAL)

`filterData.inputs.length` MUST equal `cellSchema.mainRow.length`.
- `inputs[i]` defines the header/filter for column `i`.
- `mainRow[i]` defines the cell for column `i`.
- `inputs[i].style.width` sets the width for both.

Mismatch → columns will visually misalign.

Column-width rules:
- Use `%` (not `px`).
- Visible columns' widths should sum to ~100%.
- Typical buckets: IDs `6–10%`, names `10–20%`, status/type `6–12%`, dates `8–15%`, descriptions `12–20%`.
- Hidden filter rows should use `style: { display: 'none', width: '0' }` and `hiddenColumn: true`.

---

## Component wiring — full pattern

```typescript
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit,
  signal, TemplateRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ActionButtonsPanel, ActionButtonSubPanel, GridModule, GridFilterStorage, CustomDateUtcPipe
} from '@backoffice/shared-ui';
import { menuType } from '@backoffice/shared-ui/lib/header/menu-type.enum';
import { SettingHelperService } from '@backoffice/shared-ui/lib/grid/services/setting-helper.service';
import { FilterData, GridCell, SelectedRow } from '@backoffice/shared-ui/lib/grid/models';
import { ClearFilters } from '@backoffice/shared-ui/lib/grid/models/clear-filters.interface';

import { myFilterData, myCellSchema } from './my-page.schema';
import { MyPageService } from './my-page-service/my-page.service';
import { MyItem } from './my-page-service/my-page.interface';
import {
  GridCustomizationService, GridCustomizationState
} from '../../core/services/grid-customization/grid-customization.service';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrl: './my-page.component.scss',
  imports: [CommonModule, GridModule, ActionButtonsPanel, ActionButtonSubPanel, CustomDateUtcPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyPageComponent implements OnInit {
  @ViewChild('gridHeader', { static: true }) gridHeader!: TemplateRef<any>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr        = inject(ChangeDetectorRef);
  private readonly router     = inject(Router);
  private readonly service    = inject(MyPageService);
  private readonly setting    = inject(SettingHelperService);
  private readonly gridFilterStorage    = inject(GridFilterStorage);
  private readonly gridCustomization    = inject(GridCustomizationService);

  public readonly menuType   = menuType;
  public readonly pageCode   = 'oi_my_page_view';

  public items = signal<MyItem[]>([]);
  public filterData: FilterData = myFilterData;
  public cellSchema!: GridCell;
  public isLoadingCustomization = true;

  public activeRow: SelectedRow = { activeRow: [], rowId: 'id', activeRowColor: '#adddff' };
  public orderEvent = new Subject<any>();
  public clearAllFiltersEvent = new Subject<ClearFilters>();

  public gridPanel = [{ name: 'Setup', actionCB: () => this.openColumnsSetup() }];

  private readonly gridState: GridCustomizationState = {
    columnVisibility: {}, allColumnKeys: [], customizationOrder: []
  };

  ngOnInit(): void {
    const full = myCellSchema(this.setting);
    this.gridState.allColumnKeys = full.mainRow.map(c => c.key!).filter(Boolean);
    this.gridState.allColumnKeys.forEach(k => (this.gridState.columnVisibility[k] = true));
    this.loadCustomizationAndData();
  }

  private loadCustomizationAndData(): void {
    this.gridCustomization.getGridCustomization(this.pageCode).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => { this.isLoadingCustomization = false; return of(null); }),
      switchMap(custom => {
        if (custom?.Columns?.trim()) {
          this.gridCustomization.applyGridCustomization(custom.Columns, this.gridState);
        }
        this.cellSchema = myCellSchema(this.setting);
        this.isLoadingCustomization = false;
        return this.service.getItems().pipe(catchError(() => of<MyItem[]>([])));
      })
    ).subscribe(items => {
      this.items.set(items);
      this.restoreFilter();
      this.cdr.detectChanges();
    });
  }

  public onRowClick(row: MyItem): void {
    this.activeRow = { ...this.activeRow, activeRow: [String(row.id)] };
    this.gridFilterStorage.storeOrRestoreFilter(this.filterData, this.activeRow);
    this.router.navigate(['/my-page', row.id]);
  }

  private restoreFilter(): void {
    const stored = this.gridFilterStorage.getActiveFilter(this.filterData.filterHeader!);
    if (stored?.filters) this.filterData = stored.filters;
    if (stored?.activeRow) this.activeRow = stored.activeRow;
  }

  private openColumnsSetup(): void {
    this.gridCustomization.openSetupColumnsDialog(
      {
        title: 'Setup Columns',
        readonlyColumns: ['id'],
        columnLabelMap: { id: 'Id', name: 'Name', updated: 'Updated' },
        userMenu: menuType.operation
      },
      this.gridState,
      () => {
        this.gridCustomization.saveGridCustomizationWithCallbacks(
          this.pageCode, this.gridState,
          { reloadData: () => this.loadCustomizationAndData() }
        ).subscribe();
      }
    );
  }
}
```

---

## Filter persistence via `GridFilterStorage`

- `filterData.filterHeader` is the storage key — must be unique project-wide. Convention: `grid_filter_<PageName>`.
- `storeOrRestoreFilter(filterData, activeRow, options?)` — call on row click and before navigation.
- `getActiveFilter(filterHeader)` — call in `ngOnInit` to restore.

When renaming filter inputs between releases, pass a `migrate` function so stored filters still resolve:

```typescript
this.gridFilterStorage.storeOrRestoreFilter(filterData, activeRow, {
  migrate: (stored) => {
    const old = stored.inputs.find(i => i.name === 'Type');
    if (old) old.name = 'TypeName';
  },
  restoreFunctions: (stored, original) => {
    // re-bind customFilterFunction callbacks that can't survive JSON.stringify
    stored.inputs.forEach(s => {
      const o = original.inputs.find(i => i.name === s.name);
      if (o?.customFilterFunction) s.customFilterFunction = o.customFilterFunction;
    });
  }
});
```

> `customFilterFunction`, `optionsSortFn`, `childFilterOptions.getSource` are functions — they do not survive serialization. Always re-attach them inside `restoreFunctions` (or `setFilterDataFromStorage`).

---

## Column setup via `GridCustomizationService`

- `getGridCustomization(pageCode)` — load persisted visibility + order.
- `applyGridCustomization(columns, state)` — merge into local `GridCustomizationState`.
- `openSetupColumnsDialog({ title, readonlyColumns, columnLabelMap, userMenu }, state, onConfirm)` — open the dialog.
- `saveGridCustomizationWithCallbacks(pageCode, state, { clearFilters?, reloadData? }).subscribe()` — persist + side-effects.

Always pass a `columnLabelMap` — without it the setup dialog shows raw keys.

`pageCode` should match the permission page code wherever possible (e.g. `oi_my_page_view`). Grid customization is keyed by page code, so DO NOT share a code across different grids.

---

## Quick filters panel

For pages with prominent quick-select filters above the grid:

```html
<div class="double-column-layout">
  <bo-quick-filters-panel
    [filterGroups]="quickFiltersGroup()"
    [userMenu]="menuType.operation" />
</div>
```

Build `quickFiltersGroup` as a `signal<QuickFilterGroupItem[]>()` so changes propagate through OnPush.

---

## Collapsed grid

```html
<bo-collapsed-grid [stretchClassCondition]="!isDesktop" mobileHeader="Section">
  <bo-grid ...>...</bo-grid>
</bo-collapsed-grid>
```

| Input | Purpose |
|---|---|
| `mobileHeader` | String header for mobile |
| `desktopHeader` | String or `TemplateRef` for desktop |
| `[stretchClassCondition]` | Apply stretch class (usually `!isDesktop`) |
| `[showGridCondition]` | Toggle grid content |

---

## Nested rows

Data structure uses an `itemize` array (or whatever key you pass as `itemizeLabel`):

```typescript
cellSchema: GridCell = {
  mainRow: [
    { type: GridCellType.readonlyText, key: 'parentName' },
    { type: GridCellType.delete, removeRow: (i) => this.deleteRow(i) }
  ],
  subRow: [
    { type: GridCellType.readonlyText, key: 'childField' },
    { type: GridCellType.deleteSubRow, removeRow: (i, j) => this.deleteSubRow(i, j) }
  ]
};
```

```html
<bo-grid-cell
  [row]="row"
  [index]="i"
  [cellSchema]="cellSchema"
  [filterData]="filterData"
  [itemizeLabel]="'itemize'"
  [itemizeCondition]="canAddRow"></bo-grid-cell>
```

---

## Imports

```typescript
// component `imports` array
imports: [CommonModule, GridModule, ActionButtonsPanel, ActionButtonSubPanel]
```

Typescript imports:

```typescript
import { GridModule } from '@backoffice/shared-ui';
import { FilterData, GridCell, SelectedRow } from '@backoffice/shared-ui/lib/grid/models';
import { FilterFieldTypeEnum, GridCellType, MobGridTileType } from '@backoffice/shared-ui/lib/grid/enum';
import { SettingHelperService } from '@backoffice/shared-ui/lib/grid/services/setting-helper.service';
import { GridFilterStorage } from '@backoffice/shared-ui';
import { ClearFilters } from '@backoffice/shared-ui/lib/grid/models/clear-filters.interface';
```

Import rules:
- `GridModule` is the bundle — import it in the component's `imports: [...]`.
- Deep imports from `@backoffice/shared-ui/lib/grid/...` are fine for enums and models.
- `GridCustomizationService` lives in the app (`src/app/core/services/grid-customization/`) — NOT in shared-ui.

---

## Rules

1. **Content projection is mandatory** — render `@for (row of items(); track row.id; let odd = $odd)` + `<bo-grid-cell>` inside `<bo-grid>`. Never pass `cellSchema` to `<bo-grid>`.
2. **Column count must match** — `filterData.inputs.length === cellSchema.mainRow.length`.
3. **Column widths sum to ~100%** via `style: { width: 'X%' }`.
4. **`filterHeader` must be unique across the whole app** — convention `grid_filter_<PageName>`. Collisions corrupt other pages' stored filters.
5. **Track by stable ID** — `track row.id` (or the entity's unique key); never `$index` alone.
6. **Re-attach function filters** (`customFilterFunction`, `optionsSortFn`, `childFilterOptions.getSource`) after restoring from storage — they don't survive JSON.
7. **Always pass `columnLabelMap`** to `openSetupColumnsDialog` — otherwise the dialog shows raw field keys.
8. **Wrap in `.table-wrapper pd-big tbl-shadow mb-0` + inner `.table`** — standard shadow/padding.
9. **Use `[gridType]="'CLIENT'"` + `[clientGridPagination]="true"`** for in-memory data; use `[gridType]="'SERVER'"` + `[serviceTitle]`/`[serviceMethod]` for OData-backed grids.
10. **Use `takeUntilDestroyed(this.destroyRef)`** on all grid-related subscriptions — never manual unsubscribe.
11. **Keep `pageCode` unique per grid** — it keys the persisted column customization in `GridCustomizationService`.
