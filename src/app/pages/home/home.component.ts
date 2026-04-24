import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActionButton, ActionButtonsPanel, menuType } from '@backoffice/shared-ui';

@Component({
  selector: 'app-home',
  imports: [ActionButtonsPanel],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly menuType = menuType;
  protected readonly lastAction = signal<string | null>(null);

  protected readonly actionButtons: ActionButton[] = [
    {
      name: 'Primary action',
      actionCB: () => this.lastAction.set('Primary action clicked'),
    },
    {
      name: 'Secondary',
      actionCB: () => this.lastAction.set('Secondary clicked'),
    },
  ];
}
