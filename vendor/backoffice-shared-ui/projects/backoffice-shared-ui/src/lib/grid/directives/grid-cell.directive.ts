import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectorRef,
  ComponentRef,
  ContentChild,
  DestroyRef,
  Directive,
  EmbeddedViewRef,
  inject,
  Injector,
  Input,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

import { Observable } from 'rxjs';
import { GridCellTemplateComponent } from '../components/grid-cell-template/grid-cell-template.component';
import { MobGridTileComponent } from '../components/mob-grid-tile/mob-grid-tile.component';
import { AdDirective } from './ad-host.directive';
import { MobViewTypeDirective } from './mob-view-type.directive';

import { breakpoints } from '../constants';
import { ClickableRow, MobTileOptions } from '../models';
import { GridCellType, MobGridTileType } from '../enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[appGridCell]',
  standalone: false
})
export class GridCellDirective implements OnInit, OnChanges, AfterContentInit {
  @Input() public updateEvent!: Observable<any>;
  public appGridCell = input.required<TemplateRef<any>>();
  public context = input.required<Record<string, any>>();
  public datePipe = input<DatePipe>();
  public mainClass = input<string>('');
  public clickFn = input<ClickableRow>();
  public itemizeLabel = input<string>('itemize');
  public readonly checkBoxEvent = output<any>();

  @ContentChild(AdDirective) public adHost!: AdDirective;
  @ContentChild('cellTemplComponent', { read: GridCellTemplateComponent }) mobCell!: GridCellTemplateComponent<any>;

  public desktop!: boolean;

  private readonly _destroy$ = inject(DestroyRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly _breakpointObserver = inject(BreakpointObserver);
  private readonly _cdr = inject(ChangeDetectorRef);
  private hasView = false;
  private embeddedViewRef!: EmbeddedViewRef<any>;
  private _mobViewContainerRef!: ViewContainerRef;
  private componentRef!: ComponentRef<MobGridTileComponent> | any;
  private readonly changesHistory = {} as SimpleChanges;
  private mobCellTypes: any = {};
  private readonly injector = inject(Injector);

  public ngOnInit(): void {
    const injector = this._createDateInjector();
    this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.appGridCell(), this.context(), { injector });
    this.hasView = true;

    if (this.updateEvent) {
      this.updateEvent.pipe(takeUntilDestroyed(this._destroy$)).subscribe(row => {
        if (this.componentRef) {
          const { options } = this.componentRef.instance;

          if (!this.desktop) {
            const conditionalCols = this.context()['$implicit'].filter((c: any) => c.type === GridCellType.conditionalType);
            let counter = 0;
            const cellData = this.context()['$implicit'];

            cellData.forEach((cell: any) => {
              if (cell.conditionTypes) {
                counter++;
                const newType = cell.typeCondition(row)
                  ? cell.mobView?.conditionTypes.trueCondition
                  : cell.mobView?.conditionTypes.falseCondition;
                if (this.mobCellTypes[cell.key].type !== newType) {
                  this.mobCellTypes[cell.key].type = newType;

                  if (counter === conditionalCols.length && row.submitted) {
                    this._createMobTileView();
                  }
                }
              }
            });
          }
          if (!this.context()['subItem']) {
            const updatedOptions = { ...options, row };
            this._updateChanges(updatedOptions);
          } else if (this.context()['subItem']) {
            const updatedOptions = { ...options, row: row[this.itemizeLabel()][this.context()['subIndex']] };
            this._updateChanges(updatedOptions);
          }
        }

        if (this.embeddedViewRef) {
          this.embeddedViewRef.detectChanges();
        }
      });
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['context'] && !changes['context'].isFirstChange()) {
      this.hasView = true;
      if (!this.desktop) {
        this.viewContainer.clear();
        this.hasView = false;
        if (this.componentRef) {
          const updatedOptions = { ...this.componentRef.instance.options, subIndex: this.context()['subIndex'] };
          this._updateChanges(updatedOptions);
        }
      }
    }
  }

  public ngAfterContentInit(): void {
    this._createViewDependsOnResolution();
  }

  private _createViewDependsOnResolution(): void {
    this._breakpointObserver
      .observe(`(min-width: ${breakpoints.lg.min}px)`)
      .pipe(takeUntilDestroyed(this._destroy$))
      .subscribe(result => {
        this.desktop = result.matches;
        if (this.desktop && !this.hasView) {
          if (this._mobViewContainerRef) {
            this._mobViewContainerRef.clear();
          }
          const injector = this._createDateInjector();
          this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.appGridCell(), this.context(), { injector });

          this.hasView = true;
          this._cdr.detectChanges();
        } else if (!this.desktop && this.hasView) {
          this._createMobTileView();
          this.viewContainer.clear();
        } else if (!this.desktop && !this.hasView) {
          this._createMobTileView();
        }
      });
  }

  private _createMobTileView(): void {
    this.hasView = false;
    const options: MobTileOptions = {
      title: '',
      subTitle: '',
      rowTable: [],
      labelValue: [],
      editableRow: [],
      hasCheckbox: false,
      checkboxCB: (e: any, i: any, row: any) => {},
      index: null,
      subIndex: null,
      subRow: {
        deleteCB: (i: any, j: any) => {},
        deleteIconCondition: (row: any) => {}
      },
      row: null,
      rightAlign: {
        rightAlignText: '',
        classCondition: null
      },
      subRightAlign: {
        subRightAlignText: '',
        classCondition: null
      },
      hasDelete: false,
      deleteCB: (i: any) => {},
      deleteIconCondition: null
    };

    if (this.mobCell) {
      this._setOptions(options);
    } else {
      const injector = this._createDateInjector();
      this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.appGridCell(), this.context(), { injector });

      setTimeout(() => {
        this._setOptions(options);
        this.viewContainer.clear();
      }, 0);
    }
  }

  private _setOptions(options: MobTileOptions): void {
    this.mobCell.mobViewContainers.forEach(element => {
      options.row = element.row;

      if (element.view.mobView) {
        this.mobCellTypes[element.appMobViewType()?.key] = { type: element.view?.mobView?.type };
      }

      if (element.view.mobView?.type) {
        this._setOptionsByMobType(options, element.view.mobView.type, element);
      }

      if (element.view.type === GridCellType.checkboxText) {
        options.hasCheckbox = true;
        options.checkboxCB = (e, i, row) => element.view.changeCB(e, i, row);
        if (element.view.disableCondition) {
          options.disableCondition = (row, i, e) => element.view.disableCondition(row, i, e);
        }
        options.index = element.index;
      }

      if (element.view.type === GridCellType.deleteSubRow) {
        options.index = this.context()['index'];
        options.subIndex = this.context()['subIndex'];
        if (options.subRow) {
          options.subRow.deleteCB = (i, j, row) => element.view.removeRow(i, j, row);
          options.subRow.deleteIconCondition = element.view.condition ? row => element.view.condition(row) : () => true;
        }
      }

      if (element.view.type === GridCellType.delete) {
        options.hasDelete = true;
        options.index = this.context()['index'];
        options.deleteCB = (i, j, row) => element.view.removeRow(i, j, row);
        if (element.view.condition) {
          options.deleteIconCondition = (row: any) => element.view.condition(row);
        }
      }

      if (element.view.type === GridCellType.readonlyText) {
        if (element.view.additionalInfo) {
          if (!element.appMobViewType()?.mobView?.additionalInfoMobKey) {
            options.additionalInfo = element.view.additionalInfo;
          } else {
            options.additionalInfo = {
              [element.appMobViewType().mobView.additionalInfoMobKey]: element.view.additionalInfo
            };
          }
          options.additionalInfoMobPosition = element.view.additionalInfoMobPosition;
        }
      }
    });

    if (this.clickFn()) {
      options.rowClick = this.clickFn();
    }

    this._mobViewContainerRef = this.adHost.viewContainerRef;
    this._mobViewContainerRef.clear();
    const injector = this._createDateInjector();
    this.componentRef = this._mobViewContainerRef.createComponent<MobGridTileComponent>(MobGridTileComponent, { injector });
    options.mainClass = this.mainClass();
    this.componentRef?.instance.checkboxChanged.pipe(takeUntilDestroyed(this._destroy$)).subscribe(() => {
      this.checkBoxEvent.emit(null);
    });

    this._updateChanges(options);
    this._cdr.detectChanges();
  }

  private _setOptionsByMobType(options: MobTileOptions, type: GridCellType, element: MobViewTypeDirective): void {
    const setOptions: any = {
      [MobGridTileType.mainTitle]: () => {
        options.title = element.view.content;
        options.titleClass = { classCondition: element.view.classCondition };
      },
      [MobGridTileType.subTitle]: () => {
        options.subTitle = element.view.content;
        options.subTitleClass = { classCondition: element.view.classCondition };
      },
      [MobGridTileType.rightAlignText]: () => {
        if (options.rightAlign && options.subRightAlign) {
          options.rightAlign.rightAlignText = element.view.content;
          options.rightAlign.classCondition = element.view.classCondition;
          options.rightAlign.classList = element.view.classList;
          options.rightAlign.customTemplate = element.view.customTemplate;
          options.subRightAlign.tooltip = element.view.tooltipInfo;
          if (element.view.type === GridCellType.readonlyDate) {
            options.rightAlign.transformDate = true;
            options.rightAlign.formatDatePipe = element.view.formatDatePipe;
          }
        }
      },
      [MobGridTileType.subRightAlignText]: () => {
        if (options.subRightAlign) {
          options.subRightAlign.subRightAlignText = element.view.content;
          options.subRightAlign.classCondition = element.view.classCondition;
          options.subRightAlign.classList = element.view.classList;
          options.subRightAlign.customTemplate = element.view.customTemplate;
          options.subRightAlign.tooltip = element.view.tooltipInfo;
          if (element.view.type === GridCellType.readonlyDate) {
            options.subRightAlign.transformDate = true;
            options.subRightAlign.formatDatePipe = element.view.formatDatePipe;
          }
        }
      },
      [MobGridTileType.rowTable]: () => {
        if (options.rowTable) {
          options.rowTable.push({
            label: element.view.mobView.mobDef,
            content: element.view.mobView.content,
            order: element.view.mobView.order,
            row: element.row(),
            key: element.appMobViewType().key,
            transformDate: element.view.type === GridCellType.readonlyDate,
            customTemplate: element.view.customTemplate,
            classCondition: element.view.classCondition,
            hideZero: element.view.mobView.hideZero,
            classList: element.view.classList,
            tooltip: element.view.tooltipInfo,
            formatDatePipe: element.view.formatDatePipe
          });

          options.rowTable = options.rowTable.sort((a, b) => (a.order > b.order ? 1 : -1));
        }
      },
      [MobGridTileType.labelValue]: () => {
        if (options.labelValue) {
          options.labelValue.push({
            label: element.view.mobView.mobDef,
            content: element.view.mobView.content,
            order: element.view.mobView.order,
            row: element.row,
            key: element.appMobViewType().key,
            transformDate: element.view.type === GridCellType.readonlyDate,
            customTemplate: element.view.customTemplate,
            classCondition: element.view.classCondition,
            hideZero: element.view.hideZero,
            classList: element.view.classList,
            showEmptyLabelValue: element.view.mobView.showEmptyLabelValue,
            tooltip: element.view.tooltipInfo,
            formatDatePipe: element.view.formatDatePipe
          });

          options.labelValue = options.labelValue.sort((a, b) => (a.order > b.order ? 1 : -1));
        }
      },
      [MobGridTileType.editableRow]: () => {
        if (options.editableRow) {
          options.editableRow.push({
            label:
              !element.view.mobView.mobDefCondition || element.view.mobView.mobDefCondition(element.row())
                ? element.view.mobView.mobDef
                : '',
            content: element.view.mobView.content,
            order: element.view.mobView.order,
            row: element.row,
            key: element.appMobViewType().key,
            index: this.context()['subIndex'],
            template: element.view.template,
            visible: element.view.condition ? (row: any) => element.view.condition(row) : () => true
          });

          options.editableRow = options.editableRow.sort((a, b) => (a.order > b.order ? 1 : -1));
        }
      },
      [MobGridTileType.twoEntities]: () => {
        element.view.mobView.twoEntitiesKeys.forEach((item: any, index: any) => {
          if (options.labelValue) {
            options.labelValue.push({
              label: element.view.mobView.twoEntitiesLabels[index],
              content: element.view.mobView.content,
              order: element.view.mobView.twoEntitiesOrder[index],
              row: element.row,
              key: item,
              transformDate: element.view.type === GridCellType.readonlyDate,
              customTemplate: element.view.customTemplate,
              classCondition: element.view.classCondition,
              hideZero: element.view.hideZero,
              classList: element.view.classList,
              showEmptyLabelValue: element.view.mobView.showEmptyLabelValue,
              tooltip: element.view.tooltipInfo,
              formatDatePipe: element.view.formatDatePipe
            });
          }
        });
        if (options.labelValue) {
          options.labelValue = options.labelValue.sort((a, b) => (a.order > b.order ? 1 : -1));
        }
      }
    };

    setOptions[type]();
  }

  private _updateChanges(options: Record<string, any>): void {
    const currentChanges = {} as SimpleChanges;

    Object.keys(options).forEach(key => {
      const previousChange = this.changesHistory[key];
      let currentChange: SimpleChange;
      if (previousChange) {
        currentChange = {
          previousValue: previousChange.currentValue,
          currentValue: options[key],
          firstChange: false
        } as SimpleChange;
      } else {
        currentChange = {
          currentValue: options[key],
          firstChange: true
        } as SimpleChange;
      }

      this.changesHistory[key] = currentChange;
      currentChanges[key] = currentChange;
      this.componentRef.instance.options[key] = currentChange.currentValue as string;
    });

    this.componentRef.instance.ngOnChanges(currentChanges);
    this._cdr.detectChanges();
  }

  private _createDateInjector(): Injector {
    // @ts-expect-error can show ts error
    return Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: DatePipe,
          useClass: this.datePipe()
        }
      ]
    });
  }
}
