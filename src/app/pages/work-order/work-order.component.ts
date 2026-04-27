import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  inject,
  signal,
  viewChild,
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
  Tabber,
  menuType,
} from '@backoffice/shared-ui';
import { TabItem } from '@backoffice/shared-ui/lib/tabber/tabber.interface';
import { FilterData, GridCell } from '@backoffice/shared-ui/lib/grid/models';
import { FilterFieldTypeEnum, GridCellType } from '@backoffice/shared-ui/lib/grid/enum';
import { MenuService } from '@backoffice/shared-ui/lib/header/menu-service/menu-items.service';
import { SiteInfo } from '@backoffice/shared-ui/lib/header/site-info.interface';
import { MockMenuService } from './mock-menu.service';
import {
  MaintenanceHistoryRow,
  PartHistoryRow,
  UnitAttachment,
  WorkOrderService,
} from './work-order-service/work-order.service';

@Component({
  selector: 'app-work-order',
  imports: [
    Header,
    ActionButtonsPanel,
    DetailsPanel,
    Footer,
    GridModule,
    Tabber,
    ReactiveFormsModule,
  ],
  templateUrl: './work-order.component.html',
  styleUrl: './work-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MenuService, useClass: MockMenuService }],
})
export class WorkOrderComponent {
  protected readonly menuType = menuType;

  protected readonly siteInfo = signal<SiteInfo>({
    CrewId: 1,
    CrewName: 'Demo Crew',
    CompanyName: 'OperativeIQ',
    FooterMessage: '',
    LastLoginInfo: null,
  });

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(WorkOrderService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly unitInfoTab = viewChild<TemplateRef<unknown>>('unitInfoTab');
  private readonly placeholderTab = viewChild<TemplateRef<unknown>>('placeholderTab');

  protected readonly attachments = signal<UnitAttachment[]>([]);
  protected readonly rawMaintenance = signal<MaintenanceHistoryRow[]>([]);
  protected readonly displayedMaintenance = signal<MaintenanceHistoryRow[]>([]);
  protected readonly rawPartHistory = signal<PartHistoryRow[]>([]);
  protected readonly displayedPartHistory = signal<PartHistoryRow[]>([]);

  protected readonly placeholderTabName = signal<string>('');

  protected readonly unitInfoForm: FormGroup = this.fb.group({
    unit: [''],
    vehicleType: [''],
    yearMakeModel: [''],
    vin: [''],
    licensePlate: [''],
  });

  protected readonly odometerForm: FormGroup = this.fb.group({
    miles: [''],
    hours: [''],
  });

  protected readonly telematicsForm: FormGroup = this.fb.group({
    fuel: [''],
    battery: [''],
    def: [''],
    efficiency7Days: [''],
    efficiency30Days: [''],
    motiveLastCommunication: [''],
  });

  protected readonly unitInfoFields: FieldConfig[] = [
    { label: 'Unit', type: FieldType.TextField, formControlName: 'unit' },
    { label: 'Vehicle Type', type: FieldType.TextField, formControlName: 'vehicleType' },
    { label: 'Year, Make, Model', type: FieldType.TextField, formControlName: 'yearMakeModel' },
    { label: 'VIN', type: FieldType.TextField, formControlName: 'vin' },
    { label: 'License Plate', type: FieldType.TextField, formControlName: 'licensePlate' },
  ];

  protected readonly odometerFields: FieldConfig[] = [
    { label: 'Miles', type: FieldType.TextField, formControlName: 'miles' },
    { label: 'Hours', type: FieldType.TextField, formControlName: 'hours' },
  ];

  protected readonly telematicsFields: FieldConfig[] = [
    { label: 'Fuel', type: FieldType.ReadOnly, formControlName: 'fuel' },
    { label: 'Battery', type: FieldType.ReadOnly, formControlName: 'battery' },
    { label: 'DEF', type: FieldType.ReadOnly, formControlName: 'def' },
    { label: 'Efficiency 7 days', type: FieldType.ReadOnly, formControlName: 'efficiency7Days' },
    { label: 'Efficiency 30 days', type: FieldType.ReadOnly, formControlName: 'efficiency30Days' },
    { label: 'Motive Last Communication', type: FieldType.ReadOnly, formControlName: 'motiveLastCommunication' },
  ];

  protected readonly maintenanceCellSchema: GridCell = {
    mainRow: [
      { type: GridCellType.readonlyText, key: 'date' },
      { type: GridCellType.readonlyText, key: 'unit' },
      { type: GridCellType.readonlyText, key: 'woNumber' },
      { type: GridCellType.readonlyText, key: 'customer' },
      { type: GridCellType.readonlyText, key: 'woStatus' },
      { type: GridCellType.readonlyText, key: 'services' },
      { type: GridCellType.readonlyText, key: 'workOrderType' },
      { type: GridCellType.readonlyText, key: 'reason' },
      { type: GridCellType.readonlyText, key: 'description' },
      { type: GridCellType.readonlyText, key: 'serviceCompletion' },
      { type: GridCellType.readonlyText, key: 'hours' },
      { type: GridCellType.readonlyText, key: 'miles' },
      { type: GridCellType.readonlyText, key: 'labor' },
      { type: GridCellType.readonlyText, key: 'parts' },
      { type: GridCellType.readonlyText, key: 'fees' },
      { type: GridCellType.readonlyText, key: 'total' },
    ],
  };

  protected readonly partHistoryCellSchema: GridCell = {
    mainRow: [
      { type: GridCellType.readonlyText, key: 'dateInstalled' },
      { type: GridCellType.readonlyText, key: 'woNumber' },
      { type: GridCellType.readonlyText, key: 'partNumber' },
      { type: GridCellType.readonlyText, key: 'description' },
      { type: GridCellType.readonlyText, key: 'manufacturer' },
      { type: GridCellType.readonlyText, key: 'quantity' },
      { type: GridCellType.readonlyText, key: 'cost' },
      { type: GridCellType.readonlyText, key: 'warrantyExpiration' },
      { type: GridCellType.readonlyText, key: 'installedBy' },
    ],
  };

  protected readonly partHistoryFilterData: FilterData = {
    filterHeader: 'grid_filter_WorkOrderPartHistory',
    userMenu: menuType.operation,
    inputs: [
      { label: 'Date Installed',       type: FilterFieldTypeEnum.Input, name: 'dateInstalled',       value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '11%' } },
      { label: 'WO #',                 type: FilterFieldTypeEnum.Input, name: 'woNumber',            value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '9%' } },
      { label: 'Part Number',          type: FilterFieldTypeEnum.Input, name: 'partNumber',          value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '12%' } },
      { label: 'Description',          type: FilterFieldTypeEnum.Input, name: 'description',         value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '20%' } },
      { label: 'Manufacturer',         type: FilterFieldTypeEnum.Input, name: 'manufacturer',        value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '12%' } },
      { label: 'Quantity',             type: FilterFieldTypeEnum.Input, name: 'quantity',            value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '7%' } },
      { label: 'Cost',                 type: FilterFieldTypeEnum.Input, name: 'cost',                value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '7%' } },
      { label: 'Warranty Expiration',  type: FilterFieldTypeEnum.Input, name: 'warrantyExpiration',  value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '12%' } },
      { label: 'Installed By',         type: FilterFieldTypeEnum.Input, name: 'installedBy',         value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '10%' } },
    ],
    sortOptions: { default: { key: 'dateInstalled', direction: 'desc' } },
    mobSearch: '',
    mobSearchPlaceholder: 'Part Number, Description, Manufacturer',
  };

  private readonly woStatusOptions = [
    { id: '', value: 'All' },
    { id: 'Open', value: 'Open' },
    { id: 'Closed', value: 'Closed' },
  ];

  protected readonly maintenanceFilterData: FilterData = {
    filterHeader: 'grid_filter_WorkOrderMaintenanceHistory',
    userMenu: menuType.operation,
    inputs: [
      { label: 'Date',         type: FilterFieldTypeEnum.Input,  name: 'date',              value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '8%' } },
      { label: 'Unit',         type: FilterFieldTypeEnum.Input,  name: 'unit',              value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '6%' } },
      { label: 'WO #',         type: FilterFieldTypeEnum.Input,  name: 'woNumber',          value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '7%' } },
      { label: 'Customer',     type: FilterFieldTypeEnum.Input,  name: 'customer',          value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '10%' } },
      { label: 'WO Status',    type: FilterFieldTypeEnum.Select, name: 'woStatus',          options: this.woStatusOptions, value: '', hasSorting: true, dataType: 'exact-match-string', customSortDataType: 'string', style: { width: '7%' } },
      { label: 'Services',     type: FilterFieldTypeEnum.Input,  name: 'services',          value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '6%' } },
      { label: 'Type',         type: FilterFieldTypeEnum.Input,  name: 'workOrderType',     value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '7%' } },
      { label: 'Reason',       type: FilterFieldTypeEnum.Input,  name: 'reason',            value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '9%' } },
      { label: 'Description',  type: FilterFieldTypeEnum.Input,  name: 'description',       value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '10%' } },
      { label: 'Completion',   type: FilterFieldTypeEnum.Input,  name: 'serviceCompletion', value: '', hasSorting: true, dataType: 'string', customSortDataType: 'string', style: { width: '8%' } },
      { label: 'Hours',        type: FilterFieldTypeEnum.Input,  name: 'hours',             value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '5%' } },
      { label: 'Miles',        type: FilterFieldTypeEnum.Input,  name: 'miles',             value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '5%' } },
      { label: 'Labor',        type: FilterFieldTypeEnum.Input,  name: 'labor',             value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '4%' } },
      { label: 'Parts',        type: FilterFieldTypeEnum.Input,  name: 'parts',             value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '4%' } },
      { label: 'Fees',         type: FilterFieldTypeEnum.Input,  name: 'fees',              value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '4%' } },
      { label: 'Total',        type: FilterFieldTypeEnum.Input,  name: 'total',             value: '', hasSorting: true, dataType: 'number', customSortDataType: 'number', style: { width: '5%' } },
    ],
    sortOptions: { default: { key: 'date', direction: 'desc' } },
    mobSearch: '',
    mobSearchPlaceholder: 'WO #, Customer, Description',
  };

  protected readonly actionButtons: ActionButton[] = [
    { name: 'Save', actionCB: () => this.onSave() },
    { name: 'Print', actionCB: () => this.onPrint() },
  ];

  protected readonly tabs = signal<TabItem[]>([]);

  constructor() {
    this.loadAll();
    queueMicrotask(() => this.buildTabs());
  }

  protected onMaintenanceDataChange(data: MaintenanceHistoryRow[]): void {
    this.displayedMaintenance.set(data);
  }

  protected onPartHistoryDataChange(data: PartHistoryRow[]): void {
    this.displayedPartHistory.set(data);
  }

  protected statusRowClass(row: MaintenanceHistoryRow): string {
    return `work-order__row work-order__row--${row.statusColor}`;
  }

  private buildTabs(): void {
    const unitInfo = this.unitInfoTab();
    const placeholder = this.placeholderTab();
    if (!unitInfo || !placeholder) {
      return;
    }
    this.tabs.set([
      { label: 'Unit Information', content: unitInfo },
      { label: 'Work Order', content: placeholder },
      { label: 'Inspection', content: placeholder },
      { label: 'Assets', content: placeholder },
      { label: 'Communication', content: placeholder },
    ]);
  }

  private loadAll(): void {
    this.service
      .getUnitInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.unitInfoForm.patchValue(data));

    this.service
      .getOdometerAndHours()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.odometerForm.patchValue(data));

    this.service
      .getVehicleTelematics()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.telematicsForm.patchValue(data));

    this.service
      .getUnitAttachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => this.attachments.set(items));

    this.service
      .getMaintenanceHistory()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.rawMaintenance.set(items);
        this.displayedMaintenance.set(items);
      });

    this.service
      .getPartHistory()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.rawPartHistory.set(items);
        this.displayedPartHistory.set(items);
      });
  }

  private onSave(): void {
    // TODO: wire to PUT /fleet/WorkOrder/:id once endpoint is available
  }

  private onPrint(): void {
    // TODO: open print preview dialog when design is available
  }
}
