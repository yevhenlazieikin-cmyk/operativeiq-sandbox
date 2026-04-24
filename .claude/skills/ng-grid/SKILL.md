---
name: ng-grid
description: Implement a data grid using bo-grid with content projection, FilterData, GridCell schema, GridFilterStorage, and GridCustomizationService
user-invocable: true
argument-hint: Model name or field list | Grid purpose summary | Options (client|server|collapsed|nested|quick-filters)
---

## CRITICAL - Content projection

`<bo-grid>` renders rows via content projection. Never pass `cellSchema` to `<bo-grid>` - render `@for` + `<bo-grid-cell>` inside it.

## Template pattern

```html
<bo-grid
  [gridType]="'CLIENT'"
  [outerService]="true"
  [filtersIncluded]="true"
  [filterData]="filterData"
  [sortedDataStore]="rawData()"
  (sortedDataChange)="onDataChange($event)"
  [userMenu]="menuType.administration"
  [scrollWindow]="false">
  @for (row of displayedData(); track row.id; let i = $index) {
    <bo-grid-cell
      [row]="row"
      [index]="i"
      [cellSchema]="cellSchema"
      [filterData]="filterData" />
  }
</bo-grid>
```

## Column count rule

`filterData.inputs.length` MUST equal `cellSchema.mainRow.length`. Widths sum to ~100%.

## FilterFieldTypeEnum values

`Input` | `Select` | `MultiSelect` | `Date` | `Default`

## GridCellType values

`readonlyText` | `readonlyDate` | `editText` | `checkboxText` | `customView` | `delete`
