import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { QuickFilterItem } from '../../models/quick-filters.interface';

@Component({
  selector: 'bo-quick-filters',
  standalone: false,
  templateUrl: './quick-filters.component.html',
  styleUrls: ['./quick-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickFiltersComponent {
  public label = input<string>('');
  public filters = input.required<QuickFilterItem[]>();
  public multiSelect = input<boolean>(false);
  public showClearFilters = input<boolean>(false);
  public readonly filterSelected = output<QuickFilterItem>();
  public readonly clearFilters = output<void>();

  public activeFilters = computed(() => {
    const filters = this.filters();

    return filters.filter(f => f.isActive && f.color !== 'all');
  });

  public activeFilter = computed(() => {
    const activeFilters = this.activeFilters();

    return activeFilters.length > 0 ? activeFilters[0] : null;
  });

  public isAllTypesActive = computed(() => this.activeFilters().length === 0);

  public onFilterClick(filter: QuickFilterItem): void {
    if (filter.color === 'all') {
      this.filterSelected.emit({ ...filter, value: 'all', isActive: true });
    } else if (this.multiSelect()) {
      this.filterSelected.emit({ ...filter, isActive: !filter.isActive });
    } else {
      if (filter.isActive) {
        this.filterSelected.emit({ ...filter, value: 'all', isActive: false });
      } else {
        this.filterSelected.emit({ ...filter, isActive: true });
      }
    }
  }
}
