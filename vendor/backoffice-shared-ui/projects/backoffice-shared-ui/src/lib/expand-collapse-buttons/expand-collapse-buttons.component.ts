import { Component, input, output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'bo-expand-collapse-buttons',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './expand-collapse-buttons.component.html',
  styleUrl: './expand-collapse-buttons.component.scss'
})
export class ExpandCollapseButtonsComponent {
  public readonly expanded = input<boolean>(true);
  public readonly toggled = output<void>();

  public onToggle(event: Event): void {
    event.stopPropagation();
    this.toggled.emit();
  }
}
