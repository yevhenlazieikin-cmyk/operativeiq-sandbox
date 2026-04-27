import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
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
  Header,
  menuType,
} from '@backoffice/shared-ui';
import { FilterData, GridCell } from '@backoffice/shared-ui/lib/grid/models';
import { FilterFieldTypeEnum, GridCellType } from '@backoffice/shared-ui/lib/grid/enum';
import { MenuService } from '@backoffice/shared-ui/lib/header/menu-service/menu-items.service';
import { SiteInfo } from '@backoffice/shared-ui/lib/header/site-info.interface';
import { AssetClass, AssetClassesService } from './asset-classes-service/asset-classes.service';
import { MockMenuService } from './mock-menu.service';

@Component({
  selector: 'app-asset-classes',
  imports: [Header, ActionButtonsPanel, DetailsPanel, Footer, GridModule, ReactiveFormsModule],
  templateUrl: './asset-classes.component.html',
  styleUrl: './asset-classes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MenuService, useClass: MockMenuService }],
})
export class AssetClassesComponent {
  protected readonly menuType = menuType;

  protected readonly siteInfo = signal<SiteInfo>({
    CrewId: 1,
    CrewName: 'Demo Crew',
    CompanyName: 'OperativeIQ',
    FooterMessage: '',
    LastLoginInfo: null,
  });

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AssetClassesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rawAssetClasses = signal<AssetClass[]>([]);
  protected readonly displayedAssetClasses = signal<AssetClass[]>([]);

  protected readonly summaryForm: FormGroup = this.fb.group({
    totalAssetClasses: [''],
    enabled: [''],
    disabled: [''],
    verifyOnFrontLine: [''],
    displayOnFrontLine: [''],
    lastUpdated: [''],
  });

  protected readonly summaryFields: FieldConfig[] = [
    { label: 'Total Asset Classes', type: FieldType.ReadOnly, formControlName: 'totalAssetClasses' },
    { label: 'Enabled', type: FieldType.ReadOnly, formControlName: 'enabled' },
    { label: 'Disabled', type: FieldType.ReadOnly, formControlName: 'disabled' },
    { label: 'Verify on Front Line', type: FieldType.ReadOnly, formControlName: 'verifyOnFrontLine' },
    { label: 'Display on Front Line', type: FieldType.ReadOnly, formControlName: 'displayOnFrontLine' },
    { label: 'Last Updated', type: FieldType.ReadOnly, formControlName: 'lastUpdated' },
  ];

  private readonly enabledOptions = [
    { id: '', value: 'All' },
    { id: 'Enabled', value: 'Enabled' },
    { id: 'Disabled', value: 'Disabled' },
  ];

  protected readonly cellSchema: GridCell = {
    mainRow: [
      { type: GridCellType.readonlyText, key: 'name' },
      { type: GridCellType.readonlyText, key: 'description' },
      { type: GridCellType.readonlyText, key: 'verifyOnFrontLine' },
      { type: GridCellType.readonlyText, key: 'scheduling' },
      { type: GridCellType.readonlyText, key: 'displayOnFrontLine' },
      { type: GridCellType.readonlyText, key: 'status' },
    ],
  };

  protected readonly filterData: FilterData = {
    filterHeader: 'grid_filter_AssetClasses',
    userMenu: menuType.administration,
    inputs: [
      {
        label: 'Asset Class Name',
        type: FilterFieldTypeEnum.Input,
        name: 'name',
        value: '',
        hasSorting: true,
        dataType: 'string',
        customSortDataType: 'string',
        style: { width: '20%' },
      },
      {
        label: 'Description',
        type: FilterFieldTypeEnum.Input,
        name: 'description',
        value: '',
        hasSorting: true,
        dataType: 'string',
        customSortDataType: 'string',
        style: { width: '24%' },
      },
      {
        label: 'Verify on Front Line',
        type: FilterFieldTypeEnum.Select,
        name: 'verifyOnFrontLine',
        options: this.enabledOptions,
        value: '',
        hasSorting: true,
        dataType: 'exact-match-string',
        customSortDataType: 'string',
        style: { width: '14%' },
      },
      {
        label: 'Scheduling',
        type: FilterFieldTypeEnum.Input,
        name: 'scheduling',
        value: '',
        hasSorting: true,
        dataType: 'string',
        customSortDataType: 'string',
        style: { width: '12%' },
      },
      {
        label: 'Display on Front Line',
        type: FilterFieldTypeEnum.Select,
        name: 'displayOnFrontLine',
        options: this.enabledOptions,
        value: '',
        hasSorting: true,
        dataType: 'exact-match-string',
        customSortDataType: 'string',
        style: { width: '15%' },
      },
      {
        label: 'Status',
        type: FilterFieldTypeEnum.Select,
        name: 'status',
        options: this.enabledOptions,
        value: '',
        hasSorting: true,
        dataType: 'exact-match-string',
        customSortDataType: 'string',
        style: { width: '15%' },
      },
    ],
    sortOptions: {
      default: { key: 'name', direction: 'asc' },
    },
    mobSearch: '',
    mobSearchPlaceholder: 'Asset Class Name, Description',
  };

  protected readonly actionButtons: ActionButton[] = [
    { name: 'New', actionCB: () => this.onNew() },
    { name: 'Sort', actionCB: () => this.onSort() },
    { name: 'Asset Management', actionCB: () => this.onAssetManagement() },
  ];

  constructor() {
    this.loadSummary();
    this.loadAssetClasses();
  }

  protected onDataChange(data: AssetClass[]): void {
    this.displayedAssetClasses.set(data);
  }

  private loadSummary(): void {
    this.service
      .getSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((summary) => this.summaryForm.patchValue(summary));
  }

  private loadAssetClasses(): void {
    this.service
      .getAssetClasses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.rawAssetClasses.set(items);
        this.displayedAssetClasses.set(items);
      });
  }

  private onNew(): void {
    // TODO: open create-asset-class dialog when design is available
  }

  private onSort(): void {
    // TODO: open generic sort dialog when sort fields are confirmed
  }

  private onAssetManagement(): void {
    // TODO: navigate to Asset Management list when that page exists
  }
}
