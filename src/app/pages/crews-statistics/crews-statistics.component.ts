import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActionButton,
  ActionButtonsPanel,
  DetailsPanel,
  FieldConfig,
  FieldType,
  Footer,
  GridModule,
  menuType,
  TabItem,
  Tabber
} from '@backoffice/shared-ui';
import { GridCell, FilterData } from '@backoffice/shared-ui/lib/grid/models';
import { GridCellType, FilterFieldTypeEnum } from '@backoffice/shared-ui/lib/grid/enum';
import { CrewMember, CrewsStatisticsService } from './crews-statistics-service/crews-statistics.service';

@Component({
  selector: 'app-crews-statistics',
  imports: [ActionButtonsPanel, Tabber, DetailsPanel, Footer, GridModule, ReactiveFormsModule],
  templateUrl: './crews-statistics.component.html',
  styleUrl: './crews-statistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrewsStatisticsComponent implements AfterViewInit {
  protected readonly menuType = menuType;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CrewsStatisticsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly summaryTabRef = viewChild<TemplateRef<void>>('summaryTab');
  private readonly performanceTabRef = viewChild<TemplateRef<void>>('performanceTab');

  protected readonly tabs = signal<TabItem[]>([]);
  protected readonly selectedTabIndex = signal(0);

  protected readonly summaryForm: FormGroup = this.fb.group({
    totalCrews: [''], activeCrews: [''], inactiveCrews: [''], totalMembers: [''], averageCrewSize: ['']
  });

  protected readonly summaryFields: FieldConfig[] = [
    { label: 'Total Crews', type: FieldType.ReadOnly, formControlName: 'totalCrews' },
    { label: 'Active Crews', type: FieldType.ReadOnly, formControlName: 'activeCrews' },
    { label: 'Inactive Crews', type: FieldType.ReadOnly, formControlName: 'inactiveCrews' },
    { label: 'Total Members', type: FieldType.ReadOnly, formControlName: 'totalMembers' },
    { label: 'Average Crew Size', type: FieldType.ReadOnly, formControlName: 'averageCrewSize' }
  ];

  protected readonly performanceForm: FormGroup = this.fb.group({
    tasksCompletedThisMonth: [''], avgResponseTimeMin: [''], incidentResolvedRatePct: [''], trainingCompletionRatePct: ['']
  });

  protected readonly performanceFields: FieldConfig[] = [
    { label: 'Tasks Completed (This Month)', type: FieldType.ReadOnly, formControlName: 'tasksCompletedThisMonth' },
    { label: 'Avg. Response Time', type: FieldType.ReadOnly, formControlName: 'avgResponseTimeMin' },
    { label: 'Incident Resolved Rate', type: FieldType.ReadOnly, formControlName: 'incidentResolvedRatePct' },
    { label: 'Training Completion Rate', type: FieldType.ReadOnly, formControlName: 'trainingCompletionRatePct' }
  ];

  protected readonly rawMemberData = signal<CrewMember[]>([]);
  protected readonly displayedMembers = signal<CrewMember[]>([]);

  protected readonly cellSchema: GridCell = {
    mainRow: [
      { type: GridCellType.readonlyText, key: 'name' },
      { type: GridCellType.readonlyText, key: 'role' },
      { type: GridCellType.readonlyText, key: 'station' },
      { type: GridCellType.readonlyText, key: 'country' },
      { type: GridCellType.readonlyText, key: 'tasksCompleted' },
      { type: GridCellType.readonlyText, key: 'avgResponseTimeMin' }
    ]
  };

  protected readonly filterData: FilterData = {
    inputs: [
      { label: 'Name', type: FilterFieldTypeEnum.Input, name: 'name', hasSorting: true, customSortDataType: 'string', style: { width: '20%' } },
      { label: 'Role', type: FilterFieldTypeEnum.Input, name: 'role', hasSorting: true, customSortDataType: 'string', style: { width: '15%' } },
      { label: 'Station', type: FilterFieldTypeEnum.Input, name: 'station', hasSorting: true, customSortDataType: 'string', style: { width: '15%' } },
      { label: 'Country', type: FilterFieldTypeEnum.Input, name: 'country', hasSorting: true, customSortDataType: 'string', style: { width: '15%' } },
      { label: 'Tasks Completed', type: FilterFieldTypeEnum.Default, name: 'tasksCompleted', hasSorting: true, customSortDataType: 'number', style: { width: '20%' } },
      { label: 'Avg Response (min)', type: FilterFieldTypeEnum.Default, name: 'avgResponseTimeMin', hasSorting: true, customSortDataType: 'number', style: { width: '15%' } }
    ],
    sortOptions: { default: { key: 'name', direction: 'asc' } }
  };

  protected readonly actionButtons: ActionButton[] = [
    { name: 'Export', actionCB: () => this.exportData() }
  ];

  constructor() { this.loadData(); }

  ngAfterViewInit(): void {
    const summary = this.summaryTabRef();
    const performance = this.performanceTabRef();
    if (summary && performance) {
      this.tabs.set([
        { label: 'Summary', content: summary },
        { label: 'Performance', content: performance }
      ]);
    }
  }

  protected onDataChange(data: CrewMember[]): void { this.displayedMembers.set(data); }

  private loadData(): void {
    this.service.getSummary().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(s => {
      this.summaryForm.patchValue({
        totalCrews: String(s.totalCrews), activeCrews: String(s.activeCrews),
        inactiveCrews: String(s.inactiveCrews), totalMembers: String(s.totalMembers),
        averageCrewSize: String(s.averageCrewSize)
      });
    });
    this.service.getPerformance().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => {
      this.performanceForm.patchValue({
        tasksCompletedThisMonth: String(p.tasksCompletedThisMonth),
        avgResponseTimeMin: `${p.avgResponseTimeMin} min`,
        incidentResolvedRatePct: `${p.incidentResolvedRatePct}%`,
        trainingCompletionRatePct: `${p.trainingCompletionRatePct}%`
      });
    });
    this.service.getMembers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(members => {
      this.rawMemberData.set(members);
      this.displayedMembers.set(members);
    });
  }

  private exportData(): void {
    // TODO: implement export when backend endpoint is available
  }
}
