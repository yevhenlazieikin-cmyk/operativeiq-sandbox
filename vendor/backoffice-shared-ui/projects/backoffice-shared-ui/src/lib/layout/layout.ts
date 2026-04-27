import { Component, DestroyRef, inject, input, output, OnInit, signal } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { Router, RoutesRecognized, ActivatedRouteSnapshot } from '@angular/router';
import { menuType } from '../header/menu-type.enum';
import { HeaderFeatureFlags } from '../header/header-feature-flags.interface';
import { SiteInfo } from '../header/site-info.interface';
import { HeaderService } from '../header/menu-service/header.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationsComponent } from '@backoffice/shared-ui/lib/notifications/notifications.component';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';

@Component({
  selector: 'bo-layout',
  imports: [CommonModule, Header, Footer, NotificationsComponent, SvgIconComponent],
  standalone: true,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout implements OnInit {
  public headerDataSourceUrl = input.required<string>();
  public appUrl = input.required<string>();
  public headerLinksSourceUrl = input<string>();
  public featureFlags = input<HeaderFeatureFlags>({
    flEnabled: false,
    rfidHandheldEnabled: false,
    upgradeToFrontLineEnabled: false,
    statusBoardEnabled: false
  });
  public initialMenuType = signal<menuType | undefined>(undefined);
  public aiAgentEnabled = input<boolean | undefined>();
  public handheldExpirationSeconds = input<number>();
  public siteInfo = signal<SiteInfo | null>(null);
  public readonly profileEditClick = output<void>();
  public readonly menuTypeChanged = output<menuType>();

  private readonly router = inject(Router);
  private readonly headerService = inject(HeaderService);
  private readonly destroyRef = inject(DestroyRef);

  public onProfileEditClick(): void {
    this.profileEditClick.emit();
  }

  public ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event): event is RoutesRecognized => event instanceof RoutesRecognized)
      )
      .subscribe(event => {
        this.updateMenuTypeFromRoute(event.state.root);
      });

    // Fetch siteInfo for header and footer
    this.headerService
      .getSiteInfo(this.headerDataSourceUrl())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(info => {
        this.siteInfo.set(info);
      });
  }

  private updateMenuTypeFromRoute(snapshot: ActivatedRouteSnapshot): void {
    let route = snapshot;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const menuTypeData = route.data['menuType'] as string;

    if (menuTypeData === 'OPERATION') {
      this.initialMenuType.set(menuType.operation);
    } else {
      this.initialMenuType.set(menuType.administration);
    }

    this.menuTypeChanged.emit(<menuType>this.initialMenuType());
  }
}
