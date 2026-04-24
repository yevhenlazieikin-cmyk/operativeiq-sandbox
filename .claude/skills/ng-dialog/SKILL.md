---
name: ng-dialog
description: Reuse a shared-ui dialog (BaseDialog, ConfigurableDialog, BaseSelectEntityDialog, MultipleSelectEntityDialog, GenericSortDialog) or — only if nothing fits — create a custom Angular 20 dialog
user-invocable: true
argument-hint: Dialog name | Dialog summary | Type (simple|form|select|multi-select|sort|custom)
---

Parse $ARGUMENTS to extract:

- **[name]**: kebab-case file name and PascalCase class name (only used for custom dialogs).
- **[summary]**: what the dialog does — drives the implementation.
- **[type]**: dialog flavour:
  - `simple` — confirm / info / progress → `BaseDialog`
  - `form` — reactive form with `FieldConfig[]` → `ConfigurableDialog`
  - `select` — single-pick from a grid → `BaseSelectEntityDialog`
  - `multi-select` — multi-pick from a grid → `MultipleSelectEntityDialog`
  - `sort` — drag-to-sort picker → `GenericSortDialog`
  - `custom` — nothing in shared-ui fits; build it yourself

## Decision: Reuse or Create?

**Before creating a new dialog**, check if an existing `@backoffice/shared-ui` dialog fits.

| Need | Use |
|------|-----|
| Confirm / cancel / info | `BaseDialog` with `primaryButton` / `secondaryButton` |
| Confirm with progress bar | `BaseDialog` with `isProgressBar`, `progressBarCompleted`, `progressBarTotal`, `progressBarLabel` |
| Confirm with custom template | `BaseDialog` with `template: TemplateRef` |
| Reactive form in a dialog | `ConfigurableDialog` + `FieldConfig[]` (optionally via `ConfigurableDialogService`) |
| Pick one item from a grid | `BaseSelectEntityDialog` + `BaseSelectEntityContext<T>` |
| Pick many items from a grid | `MultipleSelectEntityDialog` + `BaseSelectEntityContext<T>` (checkboxes, ribbon, `closePredicate`) |
| Drag-to-reorder picker | `GenericSortDialog` |
| Column visibility setup | Already wired — call `GridCustomizationService.openSetupColumnsDialog` (see `/ng-grid`) |

All shared-ui dialogs support a `userMenu: menuType.operation | menuType.administration` (or string `'OPERATION'` / `'ADMINISTRATION'`) property for colour theming.

---

## Mat dialog panel classes used in this app

Pick one — stylesheet side effects live in the shared library.

| Panel class | When |
|---|---|
| `'configurable-dialog-panel'` | `ConfigurableDialog` (auto-applied by `ConfigurableDialogService`) |
| `'small-dialog'` | Narrow confirmations, single-field pickers (≈400–500px) |
| `'medium-dialog'` | Default for select / multi-select / form dialogs (≈680–800px) |
| `'large-dialog'` | Wide content |

For shared-ui dialogs, default widths from existing usages:
- `BaseSelectEntityDialog`: `width: '800px'`, `panelClass: 'medium-dialog'`
- `MultipleSelectEntityDialog`: `minWidth: '680px'`, `width: '680px'`, `panelClass: 'medium-dialog'`
- `ConfigurableDialog`: `width: '600px'`, `maxWidth: '90vw'`, `maxHeight: '90vh'`, `panelClass: 'configurable-dialog-panel'`
- `GenericSortDialog`: `width: '560px'`, `maxHeight: '700px'`

Always pass `disableClose: true` for anything the user must resolve, and `autoFocus: false` for pickers (prevents the first row from auto-focusing).

---

## 1. BaseDialog — simple confirm / info / progress

```typescript
import { MatDialog } from '@angular/material/dialog';
import { BaseDialog } from '@backoffice/shared-ui';

private readonly dialog = inject(MatDialog);

const ref = this.dialog.open(BaseDialog, {
  disableClose: true,
  autoFocus: false,
  data: {
    header: 'Delete item?',
    message: 'Are you sure you want to delete this record?',
    // OR messageHTML: '<b>Warning:</b> this cannot be undone.',
    // OR template: this.customTemplateRef,   // ng-template reference
    primaryButton:   { text: 'Yes', return: 'close' },
    secondaryButton: { text: 'No',  return: 'cancel' },
    userMenu: menuType.operation              // colour scheme
  }
});

ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
  if (result === 'close') {
    // confirmed
  }
});
```

Progress-bar variant (data fields `isProgressBar`, `progressBarCompleted`, `progressBarTotal`, `progressBarLabel`):

```typescript
this.dialog.open(BaseDialog, {
  disableClose: true,
  data: {
    header: 'Publishing…',
    message: 'Please wait while we finalise your task list.',
    isProgressBar: true,
    progressBarCompleted: 75,
    progressBarTotal: 100,
    progressBarLabel: 'Publishing'
  }
});
```

---

## 2. ConfigurableDialog — form dialog

The app already wraps this in `ConfigurableDialogService` (`src/app/services/configurable-dialog.ts`). Prefer the service — it sets sensible defaults (`width: '600px'`, `maxWidth: '90vw'`, `panelClass: 'configurable-dialog-panel'`).

```typescript
import { FormBuilder, Validators } from '@angular/forms';
import { FieldConfig } from '@backoffice/shared-ui/lib/details-panel/field-config.interface';
import { FieldType } from '@backoffice/shared-ui/lib/details-panel/field-type.enum';
import { menuType } from '@backoffice/shared-ui/lib/header/menu-type.enum';
import { ConfigurableDialogService } from '../../services/configurable-dialog';

private readonly fb = inject(FormBuilder);
private readonly configurableDialog = inject(ConfigurableDialogService);

public openNameDialog(): void {
  const form = this.fb.group({
    name:  ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]]
  });

  const fields: FieldConfig[] = [
    { label: 'Name',  type: FieldType.TextField, formControlName: 'name',  fullWidth: true, required: true, maxLength: 50, validationStrategy: 'submit' },
    { label: 'Email', type: FieldType.TextField, formControlName: 'email', fullWidth: true, required: true, validationStrategy: 'submit' }
  ];

  this.configurableDialog.openDialog({
    title: 'Add Contact',
    fields,
    form,
    width: '500px',
    userMenu: menuType.administration,
    buttons: [
      { label: 'Cancel', action: 'cancel', cssClass: 'color-2', autoClose: true },
      { label: 'Save',   action: 'save',   disabled: () => form.invalid }
    ]
  })
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(result => {
    if (result?.action === 'save') {
      // result.data holds form values
    }
  });
}
```

`DialogButton` fields: `label`, `action`, `cssClass?`, `color?`, `disabled?: boolean | () => boolean`, `autoClose?`, `actionCallback?(...args)`.
`DialogResult`: `{ action: string; data?: Record<string, any> }`.

If you need custom MatDialog config (non-default panelClass, height, etc.), open `ConfigurableDialog` directly:

```typescript
import { ConfigurableDialog } from '@backoffice/shared-ui';

this.dialog.open(ConfigurableDialog, {
  data: { title, fields, form, buttons, userMenu },
  width: '600px', maxWidth: '90vw', maxHeight: '90vh',
  disableClose: true,
  panelClass: 'configurable-dialog-panel'
});
```

---

## 3. BaseSelectEntityDialog — single-select from a grid

Canonical example: `src/app/core/services/division/division.select-dialog/division.select-dialog.ts`. Wrap the dialog in a service so multiple pages can reuse it.

```typescript
import { BaseSelectEntityDialog } from '@backoffice/shared-ui';
import { BaseSelectEntityContext } from '@backoffice/shared-ui/lib/base-select-entity-dialog/base-select-entity-context.interface';
import { MatDialog } from '@angular/material/dialog';

const dialogData: BaseSelectEntityContext<Division> = {
  title: 'Select Division',
  // subTitle: 'Choose one…',
  gridType: 'CLIENT',
  selectButtonTitle: 'Select',
  hasMasterCheckbox: false,
  allowFlexRow: true,
  gridOptions: {
    items: divisionOptions,
    filterData,
    cellSchema,
    filtersCondition: true,
    mobileSortingCondition: false,
    mobileFilterCondition: false,
    customUniqId: 'Id',
    infiniteScroll: true,
    activeItem: selectedItem?.Id ?? undefined
  }
};

const ref = this.dialog.open(BaseSelectEntityDialog, {
  width: '800px',
  panelClass: 'medium-dialog',
  autoFocus: false,
  disableClose: true,
  data: dialogData
});

ref.afterClosed().subscribe(result => {
  if (result?.selectedItem) {
    // single selection in result.selectedItem
  }
});
```

Build `filterData` / `cellSchema` the same way you would for a normal grid page (see `/ng-grid`). Dialog grids almost always use `gridType: 'CLIENT'`.

---

## 4. MultipleSelectEntityDialog — multi-select from a grid

Pattern from `task-list-management.component.ts`:

```typescript
import { MultipleSelectEntityDialog } from '@backoffice/shared-ui';

const dialogData: BaseSelectEntityContext<CrewOption & { checked: boolean }> = {
  title: 'Select Crew Member',
  gridType: 'CLIENT',
  selectButtonTitle: 'Select',
  hasMasterCheckbox: false,
  clientGridPagination: true,
  menuTypeButtons: 'ADMINISTRATION',
  allowFlexRow: true,
  buttons: additionalButtons,         // optional ribbon actions
  gridOptions: {
    itemsPerLoad: 25,
    items: crewMembersWithChecked,    // pre-flag checked items
    filterData,
    cellSchema,
    filtersCondition: true,
    mobileSortingCondition: false,
    mobileFilterCondition: false,
    customUniqId: 'Id',
    infiniteScroll: true
  }
};

this.selectCrewDialogRef = this.dialog.open(MultipleSelectEntityDialog, {
  minWidth: '680px',
  width: '680px',
  panelClass: 'medium-dialog',
  data: dialogData,
  autoFocus: false,
  disableClose: true,
  closePredicate(result, config, componentInstance) {
    // validate before the dialog closes (e.g. at-least-one required)
    if ((result as any)?.selectedItems?.length === 0) {
      (componentInstance as any).validationMessage = 'At least one Crew must be selected.';

      return false;
    }

    return true;
  }
});

this.selectCrewDialogRef.afterClosed().subscribe(result => {
  if (result?.selectedItems?.length) {
    // result.selectedItems is the chosen set
  }
});
```

Key extras over single-select: `closePredicate` (keep-open validation), `selectedItems` in the close result, and a ribbon of applied selections.

---

## 5. GenericSortDialog — drag-to-sort picker

```typescript
import { GenericSortDialog } from '@backoffice/shared-ui';

const ref = this.dialog.open(GenericSortDialog, {
  width: '560px',
  maxHeight: '700px',
  disableClose: true,
  data: {
    title: 'Select Supply Room',
    tableDescription: 'Drag and Drop or Click Row to Sort Supply Room by Number.',
    gridType: 'CLIENT',
    menuTypeButtons: 'OPERATION',
    gridOptions: {
      items,                   // pre-sorted array
      filterData,
      cellSchema,
      customUniqId: 'id',
      activeItem: selectedId,
      searchEnum: 'name'
    },
    allowSort: { sort: true, sortByColumnName: 'name' },
    sortColumnName: 'ordering',
    selectButtonTitle: 'Select',
    cancelButtonHidden: false,
    primaryButtonHidden: false,
    classList: ['select-room-modal']
  }
});

ref.afterClosed().subscribe(result => { /* full sorted list returned */ });

// Optional: live apply without closing
ref.componentInstance.appliedValue.subscribe(value => { /* … */ });
```

---

## 6. Custom dialog (last resort)

If **no** shared-ui dialog fits, think twice: most new "custom" dialogs should instead be a `ConfigurableDialog` with a `FieldType.CustomTemplate` slot, or a new entry added to the `backoffice-shared-ui` submodule (ask the developer first — see CLAUDE.md §4a).

If you still need a custom local dialog, put it under the page that owns it:

```
src/app/pages/<page>/<page>-dialogs/[name]/
├── [name].component.ts
├── [name].component.html
└── [name].component.scss
```

### TypeScript

```typescript
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BaseDialog } from '@backoffice/shared-ui';   // reuse shell/chrome where possible

export interface MyThingDialogData {
  header: string;
  seed?: string;
}

export interface MyThingDialogResult {
  action: 'save' | 'cancel';
  value?: string;
}

@Component({
  selector: 'app-my-thing-dialog',
  templateUrl: './my-thing-dialog.component.html',
  styleUrl: './my-thing-dialog.component.scss',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyThingDialogComponent {
  public readonly data = inject<MyThingDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MyThingDialogComponent, MyThingDialogResult>);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  public readonly form = this.fb.group({
    value: [this.data.seed ?? '', [Validators.required]]
  });

  public save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({ action: 'save', value: this.form.value.value! });
  }

  public cancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}
```

Angular 20 reminders:
- Don't set `standalone: true` (default).
- `styleUrl` singular.
- `inject()` for DI. `takeUntilDestroyed(this.destroyRef)` for cleanup — no `ReplaySubject<void>(1)`.
- Angular 17+ control flow (`@if` / `@for` / `@switch`).

### Template

```html
<div class="dialog-wrapper">
  <h2 class="dialog-title">{{ data.header }}</h2>

  <form [formGroup]="form" (ngSubmit)="save()">
    <div class="form-row">
      <label class="field-label">Value <span class="star">*</span></label>
      <input type="text" formControlName="value" />
      @if (form.get('value')?.invalid && form.get('value')?.touched) {
        <div class="error-messages"><div>Required</div></div>
      }
    </div>

    <div class="dialog-actions">
      <button type="button" class="button color-2" (click)="cancel()">Cancel</button>
      <button type="submit" class="button" [disabled]="form.invalid">Save</button>
    </div>
  </form>
</div>
```

### SCSS

```scss
@use 'variables' as *;

:host { display: block; }
```

### Opening the custom dialog

```typescript
import { MyThingDialogComponent, MyThingDialogData, MyThingDialogResult } from './my-thing-dialog/my-thing-dialog.component';

const ref = this.dialog.open<MyThingDialogComponent, MyThingDialogData, MyThingDialogResult>(
  MyThingDialogComponent,
  {
    width: '500px',
    panelClass: 'medium-dialog',
    disableClose: true,
    autoFocus: false,
    data: { header: 'Edit value', seed: current }
  }
);

ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
  if (result?.action === 'save') { /* … */ }
});
```

---

## Rules

1. **Always check shared-ui first.** `BaseDialog` covers confirm/info/progress, `ConfigurableDialog` covers form dialogs — most "custom" dialogs are avoidable.
2. Shared-ui dialogs live in `@backoffice/shared-ui` and expose a `userMenu` prop — pass `menuType.operation` / `menuType.administration` so theming matches the page.
3. For form dialogs, prefer `ConfigurableDialogService` over opening `ConfigurableDialog` directly — it already sets width/panelClass/max sizes.
4. Wrap select-entity dialogs in a `*DialogService` (provide-in-root) when multiple pages open them — follow `DivisionDialogService`.
5. Use `MultipleSelectEntityDialog`'s `closePredicate` to block close on validation errors; set `validationMessage` on the component instance to show the message.
6. Mat dialog defaults: `disableClose: true`, `autoFocus: false`, one of `panelClass: 'small-dialog' | 'medium-dialog' | 'large-dialog' | 'configurable-dialog-panel'`.
7. Custom dialog files: sibling folder inside the owning page (`<page>-dialogs/<name>/`). Don't dump them in `src/app/components/`.
8. Custom dialog Angular 20 rules: no `standalone: true`, `styleUrl` singular, `inject()`, signals, `takeUntilDestroyed`, Angular 17+ control flow.
9. Define typed `DialogData` / `DialogResult` interfaces; type `MatDialogRef<Comp, Result>` on both open and the component.
10. User-facing strings (titles, validation, notifications) go through `MessageService.get('CODE')` with entries in `src/assets/data/messages.json` — never hardcode.
11. If the "custom" dialog is clearly generic (no task-list domain), consider adding it to `backoffice-shared-ui` instead (submodule PR) — per CLAUDE.md §4a, ask first when ambiguous.
