import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActionButton } from './action-button-panel.interface';
import { menuType } from '../header/menu-type.enum';

@Component({
  selector: 'bo-action-buttons-panel',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './action-buttons-panel.html',
  styleUrl: './action-buttons-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionButtonsPanel {
  public title = input<string>('');
  public buttons = input<ActionButton[]>([]);
  public state = input<menuType>(menuType.administration);

  public readonly menuType = menuType;

  public executeAction(button: ActionButton): void {
    if (button.actionCB && typeof button.actionCB === 'function') {
      button.actionCB();
    }
  }
}
