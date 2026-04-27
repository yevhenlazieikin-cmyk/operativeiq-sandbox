import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressBarMode } from './progress-bar-mode.enum';
import { CommonModule } from '@angular/common';
import { menuType } from '../header/menu-type.enum';

@Component({
  selector: 'bo-progress-bar',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBar {
  public completed = input<number>(0);
  public total = input<number>(100);
  public showPercentage = input<boolean>(true);
  public showQuantity = input<boolean>(true);
  public mode = input<ProgressBarMode>(ProgressBarMode.DETERMINATE);
  public label = input<string>();
  public isGridItem = input<boolean>(false);
  public typeOfMenu = input<menuType>(menuType.administration);

  public percentage = computed(() => {
    if (this.total() === 0) return 0;

    return Math.round((this.completed() / this.total()) * 100);
  });

  public progressValue = computed(() => {
    if (this.mode() === ProgressBarMode.INDETERMINATE) return 0;

    return this.percentage();
  });
}
