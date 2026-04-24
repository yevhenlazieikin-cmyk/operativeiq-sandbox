---
name: ng-dialog
description: Reuse a shared-ui dialog (BaseDialog, ConfigurableDialog, BaseSelectEntityDialog, MultipleSelectEntityDialog, GenericSortDialog) or only if nothing fits create a custom Angular 20 dialog
user-invocable: true
argument-hint: Dialog name | Dialog summary | Type (simple|form|select|multi-select|sort|custom)
---

## Decision

| Need | Use |
|------|-----|
| Confirm/cancel/info | `BaseDialog` |
| Reactive form | `ConfigurableDialog` via `ConfigurableDialogService` |
| Single pick from grid | `BaseSelectEntityDialog` |
| Multi pick from grid | `MultipleSelectEntityDialog` |
| Drag-to-sort | `GenericSortDialog` |
| Nothing fits | Custom (last resort) |

## Panel classes

`'small-dialog'` | `'medium-dialog'` | `'large-dialog'` | `'configurable-dialog-panel'`

Always `disableClose: true`, `autoFocus: false`.
