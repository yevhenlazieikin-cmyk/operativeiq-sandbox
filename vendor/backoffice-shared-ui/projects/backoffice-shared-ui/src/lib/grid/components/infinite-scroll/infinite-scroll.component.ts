import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-ngx';
import { SpinnerService } from '../../services';

@Component({
  selector: 'bo-infinite-scroll',
  standalone: false,
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.scss']
})
export class InfiniteScrollComponent implements OnInit, AfterViewInit, OnDestroy {
  query = '';
  data = [];
  loading = false;
  notAllData = true;
  scroll = true;
  skip = 0;
  infiniteDataItems = [];
  scrollOptions: any;
  ngOnInitCalled = true;
  customQueryEventSubscription!: Subscription;
  customQueryInitialEventSubscription!: Subscription;
  loadItemsEventSubscription!: Subscription;
  scrollSettingsEventSubscription!: Subscription;
  private observer!: IntersectionObserver;

  @ViewChild(OverlayScrollbarsComponent) scrollbar!: OverlayScrollbarsComponent;
  @Output() public readonly updateInfiniteData = new EventEmitter();
  @Output() public readonly infiniteDataChange = new EventEmitter();
  @Output() public readonly infiniteDataStoreChange = new EventEmitter();
  @Output() public readonly detectChanges = new EventEmitter();
  @Output() public readonly dataChange = new EventEmitter();
  @Input() options!: any;
  @Input() scrollSettingsEvent!: Observable<any>;
  @Input() loadItemsEvent!: Observable<any>;
  @Input() customQueryEvent!: Observable<any>;
  @Input() customQueryInitialEvent!: Observable<any>;
  @Input() display!: string;
  @Input() URLParam: any;
  @Input() scrollWindow = true;
  @Input() scrollWindowOnMobile = false;
  @Input() infiniteScrollContainer = null;
  @Input() fromRoot = false;
  @Input() outerService = false;
  @Input() itemsPerLoad = 50;
  @Input() customQueryInitial = '';
  @Input() customQueryFilter = '';
  @Input() serviceTitle: any;
  @Input() serviceMethod: any;
  @Input() public infiniteDataCB!: (items: any) => any;

  @Input() get infiniteDataStore() {
    return this.infiniteDataItems;
  }
  set infiniteDataStore(val) {
    this.infiniteDataItems = val;
    this.infiniteDataStoreChange.emit(this.infiniteDataItems);
  }

  get element() {
    return this.host.nativeElement;
  }

  @ViewChild('anchor', { static: false }) anchor!: ElementRef<HTMLElement>;
  @ViewChild('overlayScroll', { static: false }) public overlayScroll!: OverlayScrollbarsComponent;

  public readonly cd = inject(ChangeDetectorRef);
  public readonly spinnerService = inject(SpinnerService);
  private readonly host = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  // private readonly breakpointObserver = inject(BreakpointObserver);

  public ngOnInit(): void {
    if (!this.outerService) {
      this.loadInitItems();
    }

    if (this.customQueryEvent) {
      this.customQueryEvent.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(customQuery => this.customQueryHandle(customQuery));
    }

    if (this.customQueryInitialEvent) {
      this.customQueryInitialEvent
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(customQuery => this.customQueryInitialHandle(customQuery));
    }

    if (this.scrollSettingsEvent) {
      this.scrollSettingsEvent
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(scrollSettings => this.scrollSettingsUpdate(scrollSettings));
    }
  }

  public ngAfterViewInit(): void {
    if (!this.scrollWindow && !this.infiniteScrollContainer) {
      this.scrollOptions = { callbacks: { onScroll: this.onScroll.bind(this) }, nativeScrollbarsOverlaid: { showNativeScrollbars: true } };
    }
  }

  public ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  customQueryHandle(customQuery: any) {
    this.customQueryFilter = customQuery;
    this.loadInitItems();
  }

  customQueryInitialHandle(customQuery: any) {
    this.customQueryInitial = customQuery;
  }

  loadInitItems(): void {
    this.query =
      this.customQueryInitial && this.customQueryFilter
        ? `${this.customQueryInitial} ${this.customQueryInitial.toLowerCase().includes('$filter') ? 'and ' : '&$filter='}${
            this.customQueryFilter
          }`
        : `${this.customQueryInitial}${this.customQueryFilter ? `$filter=${this.customQueryFilter}` : ''}`;
    setTimeout(() => this.spinnerService.start(), 0);
    if (this.URLParam) {
      this.serviceTitle[this.serviceMethod](`$top=${this.itemsPerLoad}${this.query ? `&${this.query}` : ''}`, this.URLParam).subscribe(
        (data: any) => {
          this.initDataHandle(data);
          this._generateObserver();
        }
      );
    } else {
      this.serviceTitle[this.serviceMethod](`$top=${this.itemsPerLoad}${this.query ? `&${this.query}` : ''}`).subscribe((data: any) => {
        this.initDataHandle(data);
        this._generateObserver();
      });
    }
  }

  loadItems(): void {
    if (this.scroll && this.notAllData) {
      this.loading = true;
      this.scroll = false;
      if (!this.scrollWindow && !this.infiniteScrollContainer) {
        this.cd.detectChanges();
      }
      !this.outerService ? this.loadNextItems() : this.updateInfiniteData.emit();
    }
  }

  loadNextItems(): void {
    if (this.infiniteDataStore.length) {
      this.skip += this.itemsPerLoad;
      if (this.URLParam) {
        this.serviceTitle[this.serviceMethod](
          `$skip=${this.skip}&$top=${this.itemsPerLoad}${this.query ? `&${this.query}` : ''}`,
          this.URLParam
        ).subscribe((data: any) => {
          this.dataHandle(data);
        });
      } else {
        this.serviceTitle[this.serviceMethod](
          `$skip=${this.skip}&$top=${this.itemsPerLoad}${this.query ? `&${this.query}` : ''}`
        ).subscribe((data: any) => {
          this.dataHandle(data);
        });
      }
    } else {
      this.loading = false;
      this.scroll = true;
    }
  }

  initDataHandle(data: any): void {
    this.spinnerService.stop();
    this.data = [];
    this.notAllData = true;
    this.skip = 0;
    this.dataHandle(data);
  }

  async dataHandle(data: any) {
    this.loading = false;

    if (data.body.length < this.itemsPerLoad) {
      this.notAllData = false;
    }
    if (this.infiniteDataCB) {
      await this.infiniteDataCB(data);
    }

    this.data = this.data.concat(data.body);
    this.infiniteDataStore = this.data;
    this.infiniteDataChange.emit(this.data);

    if (!this.scrollWindow && !this.infiniteScrollContainer) {
      this.cd.detectChanges();
      this.detectChanges.emit();
    }
    this.scroll = true;
  }

  scrollSettingsUpdate(e: any): void {
    this._generateObserver();
    if (e.key === 'loading') {
      this.loading = e.value;
    } else if (e.key === 'notAllData') {
      this.notAllData = e.value;
    } else if (e.key === 'scrollToTop' && this.overlayScroll) {
      const { viewport } = this.overlayScroll.osInstance()!.elements();
      viewport.scrollTo({ left: 0, top: 0 });
    } else if (e.key === 'scrollToCoordinates' && this.overlayScroll) {
      const { viewport } = this.overlayScroll.osInstance()!.elements();
      const rect = this.overlayScroll.getElement().getBoundingClientRect();
      const x = e.value.x - rect.left;
      const y = e.value.y - rect.top;
      viewport.scrollTo({ left: x, top: y });
    } else {
      this.scroll = e.value;
    }
    if (!this.scrollWindow && !this.infiniteScrollContainer) {
      this.cd.detectChanges();
    }
  }

  onScroll(): void {
    const { viewport } = this.overlayScroll.osInstance()!.elements();
    const { scrollLeft, scrollTop } = viewport; // get scroll offset
    if ((scrollTop * 100) / scrollLeft >= 90) {
      this.loadItems();
    }
  }

  private _generateObserver(): void {
    if (this.observer) {
      return;
    }
    const overlay = this.overlayScroll?.getElement();
    let scrollContainer;
    if (overlay) {
      scrollContainer = overlay.querySelector('.os-viewport');
    }

    const options = {
      root: overlay ? (!this.scrollWindow && !this.scrollWindowOnMobile ? scrollContainer : null) : null,
      ...this.options
    };

    this.observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting && this.loadItems();
    }, options);

    this.observer.observe(this.anchor.nativeElement);
  }
}
