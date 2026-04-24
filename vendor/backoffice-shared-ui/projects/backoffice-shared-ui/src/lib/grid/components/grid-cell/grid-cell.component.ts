import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DoCheck,
  ElementRef,
  inject,
  input,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridCellTemplateComponent } from '../grid-cell-template/grid-cell-template.component';
import { GridCellDirective } from '../../directives';
import { FilterData, GridCell, SelectedRow } from '../../models';
import { ColumnWidthService } from '../../services';

export interface Entity {
  itemize?: any[];
  checked?: boolean;
  // itemizeLabel: string;
}

@Component({
  selector: 'bo-grid-cell',
  standalone: false,
  templateUrl: './grid-cell.component.html',
  styleUrls: ['./grid-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridCellComponent<T extends Entity> implements OnInit, OnChanges, DoCheck, AfterViewInit {
  @ViewChild('cellTemplComponent', { read: GridCellTemplateComponent }) public cellTemplComponent!: GridCellTemplateComponent<Entity>;
  @ViewChildren('subTr') public subTr!: QueryList<ElementRef>;
  @ViewChildren(GridCellTemplateComponent) private readonly cellTemplComponents!: QueryList<GridCellTemplateComponent<Entity>>;
  @ViewChild(GridCellDirective, { read: GridCellDirective }) public gridCellDirective!: GridCellDirective;

  @Input() public row!: T | any;
  @Input() public index!: number;
  @Input() public cellSchema!: GridCell;
  @Input() public addNewRowCB!: (i: number, row?: T) => void;
  @Input() public filterData!: FilterData | null;
  @Input() public datePipe: any = DatePipe;
  @Input() public itemizeCondition!: boolean | ((row: any) => boolean);
  @Input() public ribbonStatusesCB!: Record<string, (...args: any) => boolean>;
  @Input() public itemizeLabel = 'itemize';
  @Input() public manualUpdateTrigger!: Observable<void>;
  @Input() public selectedRow!: SelectedRow | any;

  public differ!: KeyValueDiffer<string, number>;
  public objDifferMap = new Map<number, any>();
  public objMap = new Map<number, any>();
  public updateEvent = new Subject<T>();
  public updateEventObservable$!: Observable<T>;
  public updatePipeEvent$ = new BehaviorSubject<boolean>(false);

  private readonly _destroy$ = inject(DestroyRef);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _differsService = inject(KeyValueDiffers);
  private readonly columnWidthService = inject(ColumnWidthService);

  public get itemize(): any[] {
    return this.row.itemize || [];
  }

  public get addRowCondition(): boolean {
    return this.itemizeCondition && typeof this.itemizeCondition === 'function' ? this.itemizeCondition(this.row) : this.itemizeCondition;
  }

  public ngOnInit(): void {
    this.updateEventObservable$ = this.updateEvent.asObservable();
    this.differ = this._differsService.find(this.row).create();
    this.itemize?.forEach((item, i) => {
      this.objDifferMap.set(i, this._differsService.find(item).create());
      this.objMap.set(i, item);
    });

    // Copy styles object from header config
    this.cellSchema.mainRow = this.cellSchema.mainRow.map((item, i) => {
      const styles = this.filterData?.inputs[i]?.style ? this.filterData.inputs[i].style : {};

      return {
        ...item,
        style: item.style ? { ...styles, ...item.style } : styles
      };
    });

    this.manualUpdateTrigger?.pipe(takeUntilDestroyed(this._destroy$)).subscribe(() => {
      this.updateEvent.next(this.row);
    });
  }

  public ngAfterViewInit(): void {
    this.columnWidthService
      .getWidthChanges$()
      .pipe(takeUntilDestroyed(this._destroy$))
      .subscribe(widthMap => {
        this.cellTemplComponents.forEach(comp => comp.applyColumnWidths(widthMap));
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterData']) {
      this.cellSchema.mainRow = this.cellSchema.mainRow.map((item, i) => {
        const styles = this.filterData?.inputs[i]?.style ? this.filterData.inputs[i].style : {};

        return {
          ...item,
          style: item.style ? { ...styles, ...item.style } : styles
        };
      });
    }
  }

  public ngDoCheck(): void {
    if (this.differ) {
      const changes = this.differ.diff(this.row);
      if (changes) {
        this.updateEvent.next(this.row);
        if (this.ribbonStatusesCB) {
          const value = !this.updatePipeEvent$.getValue();
          this.updatePipeEvent$.next(value);
          this._cdr.detectChanges();
        }
      }
    }

    this.objDifferMap.forEach((key, index) => {
      const objDiffer = this.objDifferMap.get(index);

      const changes = objDiffer.diff(this.objMap.get(index));
      if (changes) {
        changes.forEachChangedItem((record: any) => {
          this.updateEvent.next(this.row);
          if (this.ribbonStatusesCB) {
            const value = !this.updatePipeEvent$.getValue();
            this.updatePipeEvent$.next(value);
            this._cdr.detectChanges();
          }
        });
      }
    });
  }

  public onRowClick(): void {
    if (this.cellSchema.onClick && this.gridCellDirective?.desktop) {
      if (this.cellSchema.onClick.condition(this.row)) {
        this.cellSchema.onClick.onClickCB(this.row);
      }
    }
  }

  public addNewRow(index: number, row: T): void {
    this.addNewRowCB(index, row);
    this.onCheckboxChanged();
  }

  public onCheckboxChanged(): void {
    this.itemize?.forEach((item, i) => {
      this.objDifferMap.set(i, this._differsService.find(item).create());
      this.objMap.set(i, item);
    });
  }

  public setActiveRowColor(): string | null {
    return this.selectedRow?.activeRow.includes(this.row[this.selectedRow.rowId]) ? this.selectedRow?.activeRowColor : null;
  }
}
