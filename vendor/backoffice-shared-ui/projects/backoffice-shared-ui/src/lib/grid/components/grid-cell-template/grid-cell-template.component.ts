import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  KeyValueDiffers,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';
import { MobViewTypeDirective, NextInputFocusDirective } from '../../directives';
import { SettingHelperService } from '../../services';
import { GeneralConst } from '../../constants';
import { MainRow } from '../../models';
import { GridCellType } from '../../enum';
import { CustomDateUtcPipe } from '../../../pipes/custom-date-utc-pipe';
import { CURRENT_TIMEZONE } from '@backoffice/shared-ui/lib/shared/tokens/current-timezone.token';

interface Entity {
  itemize?: any[];
  checked?: boolean;
}

@Component({
  selector: 'bo-grid-cell-template',
  standalone: false,
  templateUrl: './grid-cell-template.component.html',
  styleUrls: ['./grid-cell-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridCellTemplateComponent<T extends Entity> implements OnInit {
  @ViewChild('cellTempl', { read: TemplateRef }) public cellTempl!: TemplateRef<any>;
  @ViewChildren(MobViewTypeDirective, { read: MobViewTypeDirective }) public mobViewContainers!: QueryList<MobViewTypeDirective>;
  @ViewChildren(NextInputFocusDirective) public nextInputFocusDirectiveList!: QueryList<NextInputFocusDirective>;

  @Input() public row!: T;
  @Input() public subItem!: any;
  @Input() public index!: number;
  @Input() public subIndex!: number;
  @Input() public cellData!: MainRow[];
  @Input() public updateEvent!: Observable<any>;
  @Output() public readonly checkboxChanged = new EventEmitter<void>();

  public entity: any;
  public gridCellType = GridCellType;
  public dateFormat: string;
  public defaultMinValue = GeneralConst.COUNTER_CONTROL_DEFAULT_MIN_VALUE;
  public defaultMaxValue = GeneralConst.COUNTER_CONTROL_DEFAULT_MAX_VALUE;
  public utcPipe = CustomDateUtcPipe;
  public updatePipeEvent$ = new BehaviorSubject<boolean>(false);

  public readonly settingHelperService = inject(SettingHelperService);
  public readonly datePipe = inject(DatePipe);
  public currentTZ = inject(CURRENT_TIMEZONE);
  private readonly _destroy$ = inject(DestroyRef);
  private readonly _differsService = inject(KeyValueDiffers);
  private readonly _cdr = inject(ChangeDetectorRef);

  constructor() {
    this.dateFormat = this.settingHelperService.getDate()?.formatPipe;
  }

  public ngOnInit(): void {
    this.entity = this.subItem ? this.subItem : this.row;

    this.cellData = this.cellData.map(cell => {
      if (cell.conditionTypes && cell.typeCondition) {
        return {
          ...cell,
          type: cell.typeCondition(this.row) ? cell.conditionTypes.trueCondition : cell.conditionTypes.falseCondition,
          mobView: {
            ...cell.mobView,
            type: cell.typeCondition(this.row) ? cell.mobView?.conditionTypes?.trueCondition : cell.mobView?.conditionTypes?.falseCondition
          }
        };
      }

      return cell;
    }) as any;

    this.updateEvent.pipe(takeUntilDestroyed(this._destroy$)).subscribe(() => {
      this.cellData.forEach(cell => {
        if (cell.conditionTypes && cell.typeCondition) {
          const newType = cell.typeCondition(this.row) ? cell.conditionTypes.trueCondition : cell.conditionTypes.falseCondition;
          if (cell.type !== newType) {
            cell.type = newType;
            if (cell.mobView?.type && cell.mobView?.conditionTypes) {
              cell.mobView.type = cell.typeCondition(this.row)
                ? cell.mobView?.conditionTypes?.trueCondition
                : cell.mobView?.conditionTypes?.falseCondition;
            }
          }
        }
      });
      const value = !this.updatePipeEvent$.getValue();
      this.updatePipeEvent$.next(value);
      this.entity = this.subItem ? this.subItem : this.row;
      this._cdr.detectChanges();
    });
  }

  public minValueGetter(cell: MainRow): number {
    return typeof cell.minValue === 'function' ? cell.minValue(this.entity) : (cell.minValue ?? this.defaultMinValue);
  }

  public maxValueGetter(cell: MainRow): number {
    return typeof cell.maxValue === 'function' ? cell.maxValue(this.entity) : (cell.maxValue ?? this.defaultMaxValue);
  }

  public onChanged(cell: MainRow): void {
    if (cell.changeCB) {
      cell.changeCB(this.row, this.subItem, this.index);
    }
    this._cdr.detectChanges();
  }

  public onFocusOut(cell: MainRow): void {
    if (cell.onFocusOut) {
      cell.onFocusOut(this.row);
    }
  }

  public onBlur(e: any, entity: T, cell: MainRow): void {
    if (cell.onBlurCB) {
      cell.onBlurCB(e, entity);
    }
  }

  public onChangeCheckbox(event: any, cell: any): void {
    cell.changeCB(event, this.index, this.row);
    this.checkboxChanged.next();
  }

  public onSearch(event: any, cell: MainRow): void {
    if (cell.searchCB) {
      cell.searchCB(this.row, this.subItem, event);
    }
  }

  public onIconClicked(cell: MainRow): void {
    if (cell.iconClickCB) {
      cell.iconClickCB(this.row, this.index);
    }
  }

  public applyColumnWidths(widthMap: Map<string, string>): void {
    if (!this.cellData || widthMap.size === 0) {
      return;
    }
    let hasChanges = false;
    this.cellData.forEach((cell, index) => {
      const columnKey = cell.resizeNameColumn || cell.key;
      if (columnKey && widthMap.has(columnKey)) {
        if (!cell.style) {
          cell.style = {};
        }
        const width = widthMap.get(columnKey)!;
        const isLastColumn = index === this.cellData.length - 1;
        cell.style['width'] = width;
        cell.style['min-width'] = width;
        cell.style['flex-basis'] = width;
        cell.style['flex-shrink'] = '0';
        cell.style['flex-grow'] = isLastColumn ? '1' : '0';
        cell.style['max-width'] = isLastColumn ? 'none' : width;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      this._cdr.detectChanges();
    }
  }
}
