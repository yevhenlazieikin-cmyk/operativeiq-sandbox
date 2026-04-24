import { Component, computed, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSelectChange } from '@angular/material/select';
import { PaginationInterface } from '../../models';
import { UpdatePaginationService } from '../../services';

@Component({
  selector: 'bo-grid-pagination',
  standalone: false,
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class GridPaginationComponent {
  private readonly totalPages = computed(() => {
    const rows = this.rowsPerPage();
    if (rows === 0 || this.totalElements() === 0) {
      return 1;
    }

    return Math.ceil(this.totalElements() / +rows);
  });

  public pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  public isFirstPage = computed(() => this.currentPageIndex() === 1);
  public isLastPage = computed(() => this.currentPageIndex() === this.totalPages());
  public isSinglePage = computed(() => this.totalPages() <= 1);

  public totalElements = input<number>(25);
  public readonly pageEvent = output<PaginationInterface>();
  public rowsOptions = [25, 50, 100, 500];
  public currentPageIndex = signal(1);
  public previousPageIndex = signal(0);
  public rowsPerPage = signal<number>(25);

  private readonly paginationService = inject(UpdatePaginationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      if (this.rowsPerPage() === 0) {
        this.currentPageIndex.set(1);
      } else if (this.totalElements() > 0) {
        const totalPages = Math.ceil(this.totalElements() / +this.rowsPerPage());
        if (this.currentPageIndex() > totalPages) {
          this.currentPageIndex.set(totalPages || 1);
        }
      }
    });
    this.paginationUpdate();
  }

  public goToPreviousPage() {
    this.previousPageIndex.set(this.currentPageIndex());
    this.currentPageIndex.update(page => page - 1);
    this.pageEvent.emit(this.createPageObjectEvent());
  }

  public goToNextPage() {
    this.currentPageIndex.update(page => page + 1);
    this.previousPageIndex.update(page => (page === 0 ? page + (this.currentPageIndex() - 1) : page + 1));
    if (this.previousPageIndex() > this.currentPageIndex()) {
      this.previousPageIndex.set(this.currentPageIndex() - 1);
      this.pageEvent.emit(this.createPageObjectEvent());
    } else {
      this.pageEvent.emit(this.createPageObjectEvent());
    }
  }

  public goToFirstPage() {
    this.previousPageIndex.set(this.currentPageIndex());
    this.currentPageIndex.set(1);
    this.pageEvent.emit(this.createPageObjectEvent());
  }

  public goToLastPage() {
    this.previousPageIndex.set(this.currentPageIndex());
    this.currentPageIndex.set(this.totalPages());
    this.pageEvent.emit(this.createPageObjectEvent());
  }

  public onPageChange(event: MatSelectChange) {
    this.currentPageIndex.set(event.value);
    this.pageEvent.emit(this.createPageObjectEvent());
  }

  public onRowsChange(event: MatSelectChange) {
    this.rowsPerPage.set(event.value);
    this.previousPageIndex.set(0);
    this.currentPageIndex.set(1);
    this.pageEvent.emit(this.createPageObjectEvent());
  }

  private paginationUpdate(): void {
    this.paginationService.paginationData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(paginationData => {
      this.previousPageIndex.set(paginationData.previousPage);
      this.currentPageIndex.set(paginationData.currentPage);
      this.rowsPerPage.set(paginationData.rowsPerPage);
    });
  }

  private createPageObjectEvent(): PaginationInterface {
    return {
      previousPageIndex: this.previousPageIndex(),
      pageIndex: this.currentPageIndex(),
      pageSize: this.rowsPerPage(),
      length: this.totalElements()
    };
  }
}
