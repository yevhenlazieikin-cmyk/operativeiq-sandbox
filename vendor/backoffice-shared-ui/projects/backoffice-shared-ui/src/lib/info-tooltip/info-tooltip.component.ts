import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateTemplateWithOverlayService } from '../grid/services';
import { InfoTooltip } from '../grid/models';

@Component({
  selector: 'bo-info-tooltip',
  standalone: true,
  templateUrl: './info-tooltip.component.html',
  styleUrls: ['./info-tooltip.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoTooltipComponent {
  @ViewChild('tooltip') public tooltip!: TemplateRef<any>;
  @ViewChild('origin') public origin!: ElementRef;

  public displayMessage = input<string>();
  public tooltipConfig = input<InfoTooltip>();

  private readonly createTemplateWithOverlayService = inject(CreateTemplateWithOverlayService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);

  public showTooltip(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.createTemplateWithOverlayService.openOverlayWithTemplate(
      this.tooltip,
      this.origin.nativeElement,
      this.viewContainerRef,
      this.renderer,
      this.tooltipConfig()?.direction || 'ltr',
      this.tooltipConfig()?.offsetY,
      true,
      true
    );
  }
}
