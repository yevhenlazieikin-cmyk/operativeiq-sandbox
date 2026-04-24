import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  ContentChildren,
  DestroyRef,
  Directive,
  inject,
  Inject,
  input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2
} from '@angular/core';

import { fromEvent, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StickyHeaderDirective } from './sticky-header.directive';
import { GridComponent } from '../grid.component';
import { breakpoints } from '../constants';
import { WINDOW } from '../tokens/window-token';

@Directive({
  selector: '[appStickyHeaderGroup]',
  standalone: false
})
export class StickyHeaderGroupDirective implements OnInit, OnDestroy, AfterViewInit {
  @ContentChildren('gridComponent', { descendants: true }) public gridLists!: QueryList<GridComponent>;
  public headerOffset = input<boolean>(false);

  private readonly stickyList = new QueryList<StickyHeaderDirective>();
  private readonly destroy$ = inject(DestroyRef);
  private readonly renderer = inject(Renderer2);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly cdr = inject(ChangeDetectorRef);
  private scrollDocumentSubscription!: Subscription;
  private scrollSyncSubscriptions: Subscription[] = [];
  private isSyncingHorizontalScroll = false;
  private desktop = true;

  constructor(
    //eslint-disable-next-line @angular-eslint/prefer-inject
    @Inject(DOCUMENT) private readonly document: Document,
    //eslint-disable-next-line @angular-eslint/prefer-inject
    @Inject(WINDOW) private readonly window: Window
  ) {}

  ngOnInit(): void {
    this.createViewDependsOnResolution();
  }

  ngAfterViewInit(): void {
    if (this.desktop) {
      this.gridLists.changes.pipe(takeUntilDestroyed(this.destroy$)).subscribe(res => {
        this.setStickyList(res);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.scrollDocumentSubscription) {
      this.scrollDocumentSubscription.unsubscribe();
    }
    this.unsubscribeScrollSync();
    this.stickyList.reset([]);
  }

  private setStickyList(res: any): void {
    this.unsubscribeScrollSync();
    this.stickyList.reset([]);
    res.forEach((item: any) => {
      this.stickyList.reset([...this.stickyList, item.stickyHeader]);
      this.setPositionOnScrolling(item);
    });
    this.setupHorizontalScrollSync();
  }

  private setPositionOnScrolling(grid: GridComponent): void {
    if (this.scrollDocumentSubscription) {
      this.scrollDocumentSubscription.unsubscribe();
    }

    this.scrollDocumentSubscription = fromEvent(this.document, 'scroll')
      .pipe(
        takeUntilDestroyed(this.destroy$),
        distinctUntilChanged(
          (x, y) => (x.target as Document).documentElement.offsetTop !== (y.target as Document).documentElement.offsetTop
        )
      )
      .subscribe(() => {
        this.stickyList.forEach((thisSticky, i) => {
          const stickyPosition = thisSticky?.originalPosition;

          if (stickyPosition < this.window.scrollY + 80) {
            const nextSticky = this.stickyList.get(i + 1);

            if (!thisSticky.element.classList.contains('fixed')) {
              this.renderer.addClass(thisSticky.element, 'fixed');
              this.renderer.setAttribute(thisSticky.element, 'style', `width: ${thisSticky.constrainedGridWidth}px`);

              if (thisSticky.element.classList.contains('absolute')) {
                this.renderer.removeClass(thisSticky.element, 'absolute');
              }

              if (this.headerOffset()) {
                this.renderer.addClass(thisSticky.element, 'offset-125');
              }
            }
            let nextStickyPosition = 0;
            if (nextSticky) {
              nextStickyPosition = nextSticky.originalPosition - thisSticky.originalHeight;
            }

            if (this.window.scrollY >= thisSticky.gridHeight - 80) {
              this.renderer.removeClass(thisSticky.element, 'fixed');
              this.renderer.addClass(thisSticky.element, 'absolute');
              this.renderer.setAttribute(thisSticky.element, 'style', `{top: ${nextStickyPosition}px}, width: auto`);
              if (this.headerOffset()) {
                this.renderer.removeClass(thisSticky.element, 'offset-125');
              }
            }
          } else {
            const prevSticky = this.stickyList.get(i - 1);

            if (thisSticky) {
              this.renderer.removeClass(thisSticky.element, 'fixed');
              this.renderer.setAttribute(thisSticky.element, 'style', 'width: auto');
              if (this.headerOffset()) {
                this.renderer.removeClass(thisSticky.element, 'offset-125');
              }
            }

            if (prevSticky && this.window.scrollY <= thisSticky.originalPosition - thisSticky.originalHeight) {
              this.renderer.removeClass(prevSticky.element, 'absolute');
            }
          }
        });
      });
  }

  private setupHorizontalScrollSync(): void {
    this.stickyList.forEach(thisSticky => {
      const wrapper = thisSticky.element.closest('.grid-container__wrapper') as HTMLElement;
      if (!wrapper) return;

      const onBarScroll = (): void => {
        if (!thisSticky.element.classList.contains('fixed') || this.isSyncingHorizontalScroll) return;
        this.isSyncingHorizontalScroll = true;
        wrapper.scrollLeft = thisSticky.element.scrollLeft;
        this.window.requestAnimationFrame(() => {
          this.isSyncingHorizontalScroll = false;
        });
      };

      const onWrapperScroll = (): void => {
        if (!thisSticky.element.classList.contains('fixed') || this.isSyncingHorizontalScroll) return;
        this.isSyncingHorizontalScroll = true;
        thisSticky.element.scrollLeft = wrapper.scrollLeft;
        this.window.requestAnimationFrame(() => {
          this.isSyncingHorizontalScroll = false;
        });
      };

      this.scrollSyncSubscriptions.push(fromEvent(thisSticky.element, 'scroll').subscribe(onBarScroll));
      this.scrollSyncSubscriptions.push(fromEvent(wrapper, 'scroll').subscribe(onWrapperScroll));
    });
  }

  private unsubscribeScrollSync(): void {
    this.scrollSyncSubscriptions.forEach(sub => sub.unsubscribe());
    this.scrollSyncSubscriptions = [];
  }

  private createViewDependsOnResolution() {
    this.breakpointObserver
      .observe(`(min-width: ${breakpoints.lg.min}px)`)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe(result => {
        this.desktop = result.matches;
        if (this.desktop) {
          setTimeout(() => {
            this.setStickyList(this.gridLists);
          }, 100);
        } else {
          if (this.scrollDocumentSubscription) {
            this.scrollDocumentSubscription.unsubscribe();
          }
          this.unsubscribeScrollSync();
        }
      });
  }
}
