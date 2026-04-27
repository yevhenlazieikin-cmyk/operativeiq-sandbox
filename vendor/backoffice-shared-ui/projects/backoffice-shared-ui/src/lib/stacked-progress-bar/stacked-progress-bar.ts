import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackedProgressBarConfig, StackedProgressBarItem } from './stacked-progress-bar.interface';

@Component({
  selector: 'app-stacked-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stacked-progress-bar.html',
  styleUrl: './stacked-progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedProgressBar {
  public config = input.required<StackedProgressBarConfig>();

  public total = computed(() => this.config().items.reduce((sum, item) => sum + item.value, 0));

  public itemsWithPercentages = computed(() => {
    const total = this.total();

    return this.config().items.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }));
  });

  public totalPercentage = computed(() => {
    const total = this.total();
    if (total === 0) return 0;

    return Math.round((this.config().items.reduce((sum, item) => sum + item.value, 0) / total) * 100);
  });

  public totalCount = computed(() => this.config().items.reduce((sum, item) => sum + (item.count || 0), 0));
}
