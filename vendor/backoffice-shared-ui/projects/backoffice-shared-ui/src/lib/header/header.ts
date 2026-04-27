import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
  inject,
  DestroyRef,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  DOCUMENT,
  computed
} from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { QrCodeComponent } from 'ng-qrcode';
import { Toolbar } from './toolbar/toolbar';
import { menuType } from './menu-type.enum';
import { HeaderService } from './menu-service/header.service';
import { SiteInfo } from './site-info.interface';
import { LinkInfo } from './link-info.interface';
import { HeaderFeatureFlags } from './header-feature-flags.interface';
import { BaseDialog } from '../base-dialog/base-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CookieService } from 'ngx-cookie-service';
import { filter, firstValueFrom, interval, Subscription } from 'rxjs';
import {
  AiAgentService,
  AiWidgetConfig,
  AiContextService,
  AiTokenService,
  convertPermissionsToModulesPermissions,
  AI_AGENT_CONFIG,
  isAiAgentEnabled
} from '../services/ai-agent';
import { AI_AGENT_SCRIPT_INIT_DELAY } from '../services/ai-agent/ai-agent.constants';
import { NavigationEnd, Router } from '@angular/router';
import { GridFilterStorage } from '../grid/services/grid-filter-storage';
import { MessageService } from '../services/messages.service';

@Component({
  selector: 'bo-header',
  imports: [Toolbar, NgClass, NgOptimizedImage, MatDialogModule, QrCodeComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  @ViewChild('handheldContentTemplate') handheldContentTemplate!: TemplateRef<any>;

  public toolbarUrl = input.required<string>();
  public appUrl = input.required<string>();
  public headerLinksUrl = input<string>();
  public initialMenuType = input<menuType>();
  public aiAgentEnabled = input<boolean | undefined>();
  public featureFlags = input<HeaderFeatureFlags>({
    flEnabled: false,
    rfidHandheldEnabled: false,
    upgradeToFrontLineEnabled: false,
    statusBoardEnabled: false
  });
  public handheldExpirationSeconds = input<number>(30);
  public siteInfo = input<SiteInfo | null>(null);
  public userMenu = signal<string>('');
  public handheldQrCode: string | null = null;
  public readonly profileEditClick = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly siteInfoService = inject(HeaderService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cookieService = inject(CookieService);
  private readonly aiAgentService = inject(AiAgentService);
  private readonly aiContextService = inject(AiContextService);
  private readonly aiTokenService = inject(AiTokenService);
  private readonly aiAgentConfig = inject(AI_AGENT_CONFIG, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly gridFilterStorage = inject(GridFilterStorage);
  private readonly messageService = inject(MessageService);

  private handheldRefreshSubscription: Subscription | null = null;
  private handheldDialogRef: MatDialogRef<BaseDialog> | null = null;
  private aiAgentInitialized = false;

  public onProfileEditClick(): void {
    this.profileEditClick.emit();
  }

  constructor() {
    // Initialize AI agent when enabled
    effect(() => {
      const enabled = this.aiAgentEnabled();
      if (enabled === true && !this.aiAgentInitialized) {
        this.aiAgentInitialized = true;
        this.initializeAiAgent();
      }
    });
    effect(() => {
      const menuTypeValue = this.initialMenuType();
      this.userMenu.set(menuTypeValue || '');
    });
  }

  public companyName = computed(() => this.siteInfo()?.CompanyName ?? '');

  public crewName = computed(() => this.siteInfo()?.CrewName ?? '');

  public setMenuTitle(title: string): void {
    this.userMenu.set(title);
  }

  public redirectToFLDemo() {
    window.open('https://operativeiq.com/discoverfrontline');
  }

  public redirectToInternalHelp(searchquery: string) {
    if (this.headerLinksUrl() == null) {
      return;
    }
    this.siteInfoService
      .getInternalHelpLinkInfo(
        `${this.headerLinksUrl()}/Security/Login.aspx?action=get_help_url&query=${searchquery}&guid=${Math.random()}`
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: LinkInfo) => {
        if (data.message == 'no_email') {
          this.cookieService.set('ShowUpdateProfileSB', '1');
          this.cookieService.set('SearchQueryForHelp', '');
          window.document.location = '/Default/Default.aspx';
        } else {
          if (data.message.toString().indexOf('Exception') < 0) {
            this.cookieService.set('SearchQueryForHelp', '');
            this.cookieService.set('GoToHelp', '0');
            this.cookieService.set('ShowUpdateProfileSB', '0');
            window.open(data.message);
          }
        }
      });
  }

  public redirectToFrontLine() {
    if (this.headerLinksUrl() == null) {
      return;
    }
    this.siteInfoService
      .getInternalHelpLinkInfo(`${this.headerLinksUrl()}/Security/Login.aspx?action=get_front_line_url&query=&guid=${Math.random()}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: LinkInfo) => {
        window.open(data.message);
      });
  }

  public redirectToStatusBoard() {
    if (this.headerLinksUrl() == null) {
      return;
    }
    this.siteInfoService
      .getInternalHelpLinkInfo(`${this.headerLinksUrl()}/Security/Login.aspx?action=login_status_board&query=&guid=${Math.random()}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: LinkInfo) => {
        window.open(data.message);
      });
  }

  private extractTokenFromJsonResponse(response: any): string | null {
    try {
      // Parse the outer JSON response
      const outerResponse = typeof response === 'string' ? JSON.parse(response) : response;

      // Check if status is success
      if (outerResponse.status !== 'success' || !outerResponse.code) {
        return null;
      }

      // Parse the nested code JSON string
      const codeData = typeof outerResponse.code === 'string' ? JSON.parse(outerResponse.code) : outerResponse.code;

      // Extract the Data field which contains the token
      if (codeData && codeData.Data) {
        return codeData.Data;
      }

      return null;
    } catch (error) {
      console.error(this.messageService.get('ERRPR_PARSING_JSON_RESPONSE'), error);

      return null;
    }
  }

  private refreshHandheldQrCode(): void {
    if (this.headerLinksUrl() == null) {
      return;
    }
    const url = `${this.headerLinksUrl()}/Security/QuickHandheldLogin.aspx?action=getCode`;

    this.siteInfoService
      .getJsonContent(url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const token = this.extractTokenFromJsonResponse(response);
          if (token) {
            this.handheldQrCode = token;
            this.cdr.markForCheck();
          }
        },
        error: err => {
          console.error(this.messageService.get('ERROR_REFRESHING_QR_CODE'), err);
        }
      });
  }

  private startHandheldRefresh(): void {
    // Clear existing subscription if any
    this.stopHandheldRefresh();

    // Refresh immediately and then every expiration interval
    this.refreshHandheldQrCode();

    this.handheldRefreshSubscription = interval(this.handheldExpirationSeconds() * 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshHandheldQrCode();
      });
  }

  private stopHandheldRefresh(): void {
    if (this.handheldRefreshSubscription) {
      this.handheldRefreshSubscription.unsubscribe();
      this.handheldRefreshSubscription = null;
    }
  }

  public logout(): void {
    this.gridFilterStorage.removeActiveFilter();
  }

  public onHandheldClick() {
    if (this.headerLinksUrl() == null) {
      return;
    }
    const url = `${this.headerLinksUrl()}/Security/QuickHandheldLogin.aspx?action=getCode`;
    this.handheldQrCode = null; // Reset

    this.siteInfoService
      .getJsonContent(url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const token = this.extractTokenFromJsonResponse(response);

          if (!token) {
            // Show error if token extraction failed
            this.dialog.open(BaseDialog, {
              data: {
                header: 'Error',
                message: this.messageService.get('FAILED_EXTRACT_TOKEN')
              },
              width: '360px'
            });

            return;
          }

          this.handheldQrCode = token;

          this.handheldDialogRef = this.dialog.open(BaseDialog, {
            data: {
              header: 'RFID Handheld Quick Login',
              template: this.handheldContentTemplate,
              topButtons: [
                {
                  label: 'Back',
                  action: 'cancel',
                  autoClose: true,
                  return: null,
                  autofocus: false
                }
              ],
              userMenu: this.initialMenuType()
            },
            width: '360px',
            maxWidth: '360px',
            maxHeight: '90vh',
            disableClose: false
          });

          // Start auto-refresh when dialog opens
          this.startHandheldRefresh();

          // Stop refresh when dialog closes
          this.handheldDialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.stopHandheldRefresh();
              this.handheldQrCode = null;
              this.handheldDialogRef = null;
            });
        },
        error: err => {
          this.handheldQrCode = null;
          // Handle error - show error dialog using BaseDialog for simplicity
          this.dialog.open(BaseDialog, {
            data: {
              header: 'Error',
              message: this.messageService.get('FAILED_LOAD_RFID_HANDHELD')
            },
            width: '360px'
          });
        }
      });
  }

  private async initializeAiAgent(): Promise<void> {
    try {
      // Wait for DOM to be ready
      if (this.document.readyState === 'loading') {
        await new Promise<void>(resolve => {
          this.document.addEventListener('DOMContentLoaded', () => resolve());
        });
      }

      // Check if AI Agent cookie exists and has enabled assistants
      const hasCookieAndClaims = await firstValueFrom(
        this.aiTokenService.checkAiAgentCookieAndClaims().pipe(takeUntilDestroyed(this.destroyRef))
      );

      if (!hasCookieAndClaims) {
        // Reuse service for AI authorization that is used when AI Widget is opening
        return;
      }

      // Check if AI Agent is enabled before loading script
      const policyPermissionsData = this.aiAgentConfig?.policyPermissions();
      if (!isAiAgentEnabled(policyPermissionsData)) {
        return;
      }

      // Load the script using configured loader URL
      const loaderUrl = this.aiAgentService.getLoaderUrl();
      await this.aiAgentService.loadScript(loaderUrl);

      // Wait a bit for the script to fully initialize
      await new Promise(resolve => setTimeout(resolve, AI_AGENT_SCRIPT_INIT_DELAY));

      // Initialize the widget
      const widgetConfig: AiWidgetConfig = {
        embeddedConfig: {
          buttonContainer: 'ais-content',
          widgetContainer: 'ais-content',
          openWidgetCB: (successFn, errorFn) => {
            // Make request to backend to get AI token
            this.authorizeAIAssistantAndUpdateContext(successFn, errorFn);
          },
          closeWidgetCB: () => {
            // Widget closed callback
          },
          initWidgetCB: () => {
            // Widget initialized callback
            this.aiContextService.aiCheckLocalStorage();
          },
          exceptionHandler: data => {
            this.aiContextService.processAIException(data);
          },
          redirectToKnowledgeCenter: (url: string) => {
            this.redirectToInternalHelp(url);
          }
        }
      };

      this.aiAgentService.initializeWidget(widgetConfig);
      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.authorizeAIAssistantAndUpdateContext(
            () => {},
            () => {}
          );
        });
    } catch (error) {
      console.error(this.messageService.get('FAILED_INITIALIZE_AI_AGENT'), error);
      this.aiContextService.processAIException(error);
    }
  }

  private authorizeAIAssistantAndUpdateContext(successFn: () => void, errorFn: () => void) {
    this.aiTokenService.getAiToken().subscribe({
      next: tokenData => {
        try {
          let modulesPermissions: Record<string, unknown> = {};
          const policyPermissions = this.aiAgentConfig?.policyPermissions();
          if (policyPermissions) {
            modulesPermissions = convertPermissionsToModulesPermissions(this.aiAgentConfig?.isSuperAdmin ?? false, policyPermissions);
          } else if (tokenData.modulesPermissions) {
            ({ modulesPermissions } = tokenData);
          }

          const clientTokenExpiration = tokenData.expiration ? new Date(tokenData.expiration).getTime() : undefined;

          this.aiContextService.updateContextWithToken({
            authToken: tokenData.token,
            userName: tokenData.firstName || '',
            modulesPermissions: modulesPermissions || {},
            clientTokenExpiration
          });

          successFn();
        } catch (error) {
          this.aiContextService.processAIException(error);
          errorFn();
        }
      },
      error: error => {
        this.aiContextService.processAIException(error);
        errorFn();
      }
    });
  }
}
