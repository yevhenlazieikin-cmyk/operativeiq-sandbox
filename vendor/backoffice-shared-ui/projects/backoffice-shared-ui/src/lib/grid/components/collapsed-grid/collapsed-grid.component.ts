import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, DestroyRef, ElementRef, inject, input, Input, OnInit, Renderer2, signal, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { breakpoints } from '../../constants';

@Component({
  selector: 'bo-collapsed-grid',
  standalone: false,
  templateUrl: './collapsed-grid.component.html',
  styleUrls: ['./collapsed-grid.component.scss']
})
export class CollapsedGridComponent implements OnInit {
  @ViewChild('section') public section!: ElementRef;

  public stretchClassCondition = input.required<boolean>();
  public classList = input.required<string[]>();
  public desktopTitleCondition = input<boolean>(true);
  public showGridCondition = input<boolean>(true);

  public desktopStringHeader = signal<string>('');
  public desktopTemplateHeader = signal<TemplateRef<any> | null>(null);
  public mobileStringHeader = signal<string>('');
  public mobileTemplateHeader = signal<TemplateRef<any> | null>(null);
  public desktop = signal<boolean>(false);
  public isCollapsed = signal<boolean>(false);

  private readonly _destroy$ = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly _renderer = inject(Renderer2);
  private readonly _desktopHeader = signal<string | TemplateRef<any>>('');

  @Input() public set desktopHeader(value: string | TemplateRef<any>) {
    this._desktopHeader.set(value);
    if (!value) {
      return;
    }

    if (typeof value === 'string') {
      this.desktopStringHeader.set(value);
    } else {
      this.desktopTemplateHeader.set(value);
    }
  }

  public get desktopHeader(): string | TemplateRef<any> {
    return this._desktopHeader();
  }
  @Input() public set mobileHeader(value: string | TemplateRef<any>) {
    if (!value) {
      this.mobileStringHeader.set('');
      this.mobileTemplateHeader.set(null);

      return;
    }

    if (typeof value === 'string') {
      this.mobileStringHeader.set(value);
    } else {
      this.mobileTemplateHeader.set(value);
    }
  }

  public ngOnInit(): void {
    this._setResolution();
  }

  public activeSection(): void {
    if (window.innerWidth < breakpoints.lg.min) {
      const isActive = this.section.nativeElement.classList.contains('active');
      const action = isActive ? 'removeClass' : 'addClass';
      this.isCollapsed.set(!!isActive);

      this._renderer[action](this.section.nativeElement, 'active');
    }
  }

  private _setResolution(): void {
    this.breakpointObserver
      .observe(`(min-width: ${breakpoints.lg.min}px)`)
      .pipe(takeUntilDestroyed(this._destroy$))
      .subscribe(result => {
        this.desktop.set(!!result.matches);
      });
  }
}
