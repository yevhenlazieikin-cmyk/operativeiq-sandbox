import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import {
  ActionButton,
  ActionButtonsPanel,
  Footer,
  GridModule,
  menuType,
} from '@backoffice/shared-ui';
import { GridCell, FilterData } from '@backoffice/shared-ui/lib/grid/models';
import { GridCellType, FilterFieldTypeEnum } from '@backoffice/shared-ui/lib/grid/enum';
import { ClearFilters } from '@backoffice/shared-ui/lib/grid/models/clear-filters.interface';
import { Task, TaskListService } from './task-list-service/task-list.service';

@Component({
  selector: 'app-task-list',
  imports: [ActionButtonsPanel, Footer, GridModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent {
  protected readonly menuType = menuType;

  private readonly service = inject(TaskListService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rawTasks = signal<Task[]>([]);

  protected readonly clearAllFiltersEvent = new Subject<ClearFilters>();
  protected readonly orderEvent = new Subject<any>();

  protected readonly cellSchema: GridCell = {
    mainRow: [
      { type: GridCellType.readonlyText, key: 'id' },
      { type: GridCellType.readonlyText, key: 'title' },
      { type: GridCellType.readonlyText, key: 'status' },
      { type: GridCellType.readonlyText, key: 'priority' },
      { type: GridCellType.readonlyText, key: 'assignee' },
      { type: GridCellType.readonlyText, key: 'dueDate' },
      { type: GridCellType.readonlyText, key: 'createdDate' },
    ],
  };

  protected filterData: FilterData = {
    filterHeader: 'grid_filter_TaskList',
    userMenu: menuType.administration,
    inputs: [
      { label: 'ID', type: FilterFieldTypeEnum.Default, name: 'id', hasSorting: true, customSortDataType: 'number', style: { width: '6%' } },
      { label: 'Title', type: FilterFieldTypeEnum.Input, name: 'title', hasSorting: true, customSortDataType: 'string', style: { width: '28%' } },
      { label: 'Status', type: FilterFieldTypeEnum.Input, name: 'status', hasSorting: true, customSortDataType: 'string', style: { width: '14%' } },
      { label: 'Priority', type: FilterFieldTypeEnum.Input, name: 'priority', hasSorting: true, customSortDataType: 'string', style: { width: '10%' } },
      { label: 'Assignee', type: FilterFieldTypeEnum.Input, name: 'assignee', hasSorting: true, customSortDataType: 'string', style: { width: '18%' } },
      { label: 'Due Date', type: FilterFieldTypeEnum.Default, name: 'dueDate', hasSorting: true, customSortDataType: 'string', style: { width: '12%' } },
      { label: 'Created Date', type: FilterFieldTypeEnum.Default, name: 'createdDate', hasSorting: true, customSortDataType: 'string', style: { width: '12%' } },
    ],
    sortOptions: {
      default: { key: 'id', direction: 'asc' },
    },
  };

  protected readonly actionButtons: ActionButton[] = [];

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.service
      .getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tasks) => {
        this.rawTasks.set(tasks);
      });
  }
}
