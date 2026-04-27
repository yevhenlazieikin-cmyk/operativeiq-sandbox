---
name: ng-component
description: Create a standalone Angular 20 component (page-local or in backoffice-shared-ui) with OnPush, signals, inject(), and takeUntilDestroyed
user-invocable: true
argument-hint: Component name | Component summary | Placement (page-local|shared-ui) | Component path (optional)
---

Parse $ARGUMENTS to extract:

- **[name]**: kebab-case file name. Derive PascalCase class name (e.g. `status-badge` → `StatusBadgeComponent`).
- **[summary]**: what the component does — drives the implementation.
- **[placement]**: where the component lives:
  - `page-local` — inside a feature folder under `src/app/pages/<page>/` or `src/app/components/`. Selector prefix `app-`.
  - `shared-ui` — inside the `backoffice-shared-ui` submodule at `backoffice-shared-ui/projects/backoffice-shared-ui/src/lib/<name>/`. Selector prefix `bo-`. **Must also be exported from `src/public-api.ts`.**
- **[path]**: override the default path if needed.

## Placement decision (IMPORTANT)

Per CLAUDE.md, before creating the component ask yourself:

| Nature of the component | Placement |
|---|---|
| App-specific (renders domain fields, calls domain endpoints, named after an app-specific concept) | `page-local` under the owning page folder |
| Clearly generic (form control, layout primitive, dialog shell, pipe, directive, utility) — no app/domain knowledge | `shared-ui` |
| Ambiguous ("could be reused later but unsure") | **Ask the developer before writing code.** Propose target location + name + public API, get a yes/no. |

When adding to `backoffice-shared-ui`:
- Work on a submodule branch (separate PR from the app).
- Use `bo-` selector prefix.
- No imports from app-level paths, no app-specific types.
- Export from `backoffice-shared-ui/projects/backoffice-shared-ui/src/public-api.ts`.

---

## Page-local component (default)

Create files at `src/app/pages/<page>/<name>/` (or `src/app/components/<name>/` if it's a cross-page app-level widget):

Files: `[name].component.ts`, `[name].component.html`, `[name].component.scss`, `[name].component.spec.ts`.

### TypeScript pattern

```typescript
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-[name]',
  imports: [CommonModule],
  templateUrl: './[name].component.html',
  styleUrl: './[name].component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [PascalName]Component implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // subscribe with: .pipe(takeUntilDestroyed(this.destroyRef))
  }
}
```

Angular 20 notes:
- **Do not add `standalone: true`** — it is the default since Angular 19. Linting may even flag it.
- Use `styleUrl` (singular) — not `styleUrls: [...]`.
- `imports` array lists only what the template actually uses.

### Template HTML

```html
<div class="[name]-wrapper">
  <!-- component content -->
</div>
```

Use Angular 17+ control flow: `@if`, `@for (item of items; track item.id)`, `@switch`. Never `*ngIf` / `*ngFor`.

### SCSS

```scss
@use 'variables' as *;

:host {
  display: block;
}
```

Use shared tokens (`$white`, `$error-red`, `$forest-green`, `$ocean-blue`, `$font-base2`, `$font-semibold`, etc.) — not raw hex.

### Spec

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { [PascalName]Component } from './[name].component';

describe('[PascalName]Component', () => {
  let component: [PascalName]Component;
  let fixture: ComponentFixture<[PascalName]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[PascalName]Component]
    }).compileComponents();

    fixture = TestBed.createComponent([PascalName]Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## shared-ui component

Create files at `backoffice-shared-ui/projects/backoffice-shared-ui/src/lib/[name]/`:

### TypeScript

```typescript
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'bo-[name]',
  imports: [CommonModule],
  templateUrl: './[name].html',
  styleUrl: './[name].scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [PascalName] {
  private readonly destroyRef = inject(DestroyRef);
}
```

Note shared-ui convention: files are `[name].ts` / `[name].html` / `[name].scss` (no `.component` segment) and the class name has no `Component` suffix — matches existing shared-ui entries like `BaseDialog`, `DetailsPanel`, `Layout`. Follow whatever pattern the neighbours in that folder use.

### Public API export

Edit `backoffice-shared-ui/projects/backoffice-shared-ui/src/public-api.ts` and add:

```typescript
export * from './lib/[name]/[name]';
```

### SCSS

Same as page-local. Shared variables resolve through `stylePreprocessorOptions.includePaths` configured in the library's `ng-package.json`.

---

## Consumer patterns

### Inputs / outputs (signal API)

Use signal-based inputs/outputs from `@angular/core`:

```typescript
import { input, output, computed } from '@angular/core';

public readonly label = input.required<string>();
public readonly count = input<number>(0);
public readonly confirmed = output<void>();

public readonly displayLabel = computed(() => `${this.label()} (${this.count()})`);
```

### Reactive state

Prefer signals for local reactive state. Use `BehaviorSubject` only when interfacing with an existing observable pipeline.

```typescript
public readonly loading = signal(false);
public readonly items = signal<MyItem[]>([]);
public readonly hasItems = computed(() => this.items().length > 0);
```

### Subscription cleanup

Use `takeUntilDestroyed(this.destroyRef)`. Do **not** use `ReplaySubject<void>(1)` + manual `complete()` — this project has standardised on `DestroyRef`.

### Forms

Use `ReactiveFormsModule` with `FormBuilder` injected via `inject(FormBuilder)`. Reach for `FormsModule` + `ngModel` only when a shared widget (e.g. `bo-slide-toggle`) expects it.

---

## Rules

1. Use `inject()` for DI — never constructor injection.
2. Use `takeUntilDestroyed(this.destroyRef)` — never `ReplaySubject` + `takeUntil` or manual unsubscribe.
3. Use signals (`signal`, `computed`, `input`, `output`, `toSignal`) for reactive state.
4. Use Angular 17+ control flow (`@if`, `@for`, `@switch`) — never `*ngIf` / `*ngFor`.
5. Do not set `standalone: true` — it is the default in Angular 20.
6. Use `styleUrl` (singular), not `styleUrls`.
7. Check `@backoffice/shared-ui` (`public-api.ts`) for existing components before creating new ones — `bo-action-buttons-panel`, `bo-grid`, `bo-details-panel`, `bo-base-dialog`, `bo-configurable-dialog`, `bo-search-dropdown`, `bo-slide-toggle`, `bo-tabber`, `bo-progress-bar`, `bo-stacked-progress-bar`, `bo-date-picker`, `bo-time-picker`, `bo-counter`, `bo-info-tooltip`, `bo-loader`, etc.
8. If the component is clearly generic, place it in `backoffice-shared-ui`; if ambiguous, ask the developer before creating it (per CLAUDE.md).
9. Follow all other conventions from CLAUDE.md (naming, typography, SCSS variables, permissions).
