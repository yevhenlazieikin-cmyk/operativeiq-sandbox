import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActionButton } from '../action-buttons-panel/action-button-panel.interface';
import { menuType } from '../header/menu-type.enum';

@Component({
  selector: 'bo-action-button-sub-panel',
  imports: [CommonModule],
  templateUrl: './action-button-sub-panel.html',
  styleUrl: './action-button-sub-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionButtonSubPanel {
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
