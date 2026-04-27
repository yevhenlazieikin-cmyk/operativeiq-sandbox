import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ActionButton,
  ActionButtonsPanel,
  Footer,
  Header,
  menuType,
} from '@backoffice/shared-ui';
import { MenuService } from '@backoffice/shared-ui/lib/header/menu-service/menu-items.service';
import { SiteInfo } from '@backoffice/shared-ui/lib/header/site-info.interface';
import { MockMenuService } from './mock-menu.service';

@Component({
  selector: 'app-unit',
  imports: [Header, ActionButtonsPanel, Footer],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MenuService, useClass: MockMenuService }],
})
export class UnitComponent {
  protected readonly menuType = menuType;

  protected readonly siteInfo = signal<SiteInfo>({
    CrewId: 1,
    CrewName: 'Demo Crew',
    CompanyName: 'OperativeIQ',
    FooterMessage: '',
    LastLoginInfo: null,
  });

  protected readonly actionButtons: ActionButton[] = [];
}
