import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input } from '@angular/core';
import { HoverClassDirective } from '@backoffice/shared-ui/lib/svg-icon/hover-class.directive';
import { svgs } from '../../../assets/images/icon';
import { SvgsMergeService } from '@backoffice/shared-ui/lib/services/svgs-merge.service';

@Component({
  selector: 'bo-svg-icon',
  imports: [HoverClassDirective],
  templateUrl: './svg-icon.component.html',
  styleUrl: './svg-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent {
  public readonly name = input.required<string>();
  public readonly hoverClass = input<string | null>(null);
  public svgName: string | null = null;

  private readonly svgs: Record<string, string>;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly svgsMergeService = inject(SvgsMergeService);

  constructor() {
    this.svgs = this.svgsMergeService.svgs;

    effect(() => {
      if (this.name()) {
        this._setIcon(this.name());
        this.cdr.reattach();
        this.cdr.markForCheck();
      } else {
        this.cdr.detach();
      }
    });
  }

  private _setIcon(name: string): void {
    this.svgName = null;

    if (this.svgs[name]) {
      this.svgName = this.svgs[name].split('.')[0];
    }
  }
}
