import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SandboxLayoutComponent } from './layout/sandbox-layout.component';
import { SvgsMergeService } from '@backoffice/shared-ui/lib/services/svgs-merge.service';
import { svgs } from '../assets/images/icon';

@Component({
  selector: 'app-root',
  imports: [SandboxLayoutComponent],
  template: `<app-sandbox-layout />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    inject(SvgsMergeService).svgs = svgs;
  }
}
