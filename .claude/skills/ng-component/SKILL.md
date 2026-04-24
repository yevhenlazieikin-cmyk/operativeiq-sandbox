---
name: ng-component
description: Create a standalone Angular 20 component (page-local or in backoffice-shared-ui) with OnPush, signals, inject(), and takeUntilDestroyed
user-invocable: true
argument-hint: Component name | Component summary | Placement (page-local|shared-ui) | Component path (optional)
---

## Placement

- App-specific -> `page-local` under `src/app/pages/<page>/`, selector `app-`.
- Generic utility -> `shared-ui`, selector `bo-`, export from `public-api.ts`.
- Ambiguous -> ask first.

## Pattern

```typescript
@Component({
  selector: 'app-[name]',
  imports: [CommonModule],
  templateUrl: './[name].component.html',
  styleUrl: './[name].component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [PascalName]Component {
  private readonly destroyRef = inject(DestroyRef);
}
```

No `standalone: true`. `styleUrl` singular. `inject()` only. `takeUntilDestroyed(destroyRef)`.
