import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SandboxLayoutComponent } from './layout/sandbox-layout.component';

@Component({
  selector: 'app-root',
  imports: [SandboxLayoutComponent],
  template: `<app-sandbox-layout />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
