import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  KeyValueDiffers,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingHelperService } from '../../services';
import { MobTileOptions } from '../../models';

interface DateFormat {
  locale: string;
  formatAdapter: string;
  formatPipe: string;
  formatPipeFull: string;
  formatPipeShort: string;
  formatPipeDateTime: string;
}

@Component({
  selector: 'bo-mob-grid-tile',
  standalone: false,
  templateUrl: './mob-grid-tile.component.html',
  styleUrls: ['./mob-grid-tile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobGridTileComponent implements OnInit, OnChanges {
  @Input() public options: MobTileOptions = {};
  @Output() public readonly checkboxChanged = new EventEmitter<void>();

  public dateFormat!: string;
  public rightAlignDate!: string;
  public subRightAlignDate!: string;
  public borderedTile = false;
  public updatePipeEvent$ = new BehaviorSubject<boolean>(false);

  private readonly settingHelperService = inject(SettingHelperService);
  private readonly _el = inject(ElementRef);
  private readonly _differsService = inject(KeyValueDiffers);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly datePipe = inject<DatePipe>(DatePipe);

  public get itemize(): any {
    return this.options.row.itemize;
  }

  public get additionalInfoTitle() {
    if (this.options.additionalInfo && !Array.isArray(this.options.additionalInfo)) {
      return this.options.additionalInfo['title'];
    }

    return undefined;
  }

  public get additionalInfoSubTitle() {
    if (this.options.additionalInfo && !Array.isArray(this.options.additionalInfo)) {
      return this.options.additionalInfo['subTitle'];
    }

    return undefined;
  }

  constructor() {} // @Inject(DatePipe) public readonly datePipe: DatePipe // For possibility to use date, custom entry and utc date pipes

  public ngOnInit(): void {
    this._setDateValues();

    if (this._el.nativeElement.closest('.colored-row')) {
      this.borderedTile = true;
      this._cdr.markForCheck();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // Listen options key changes if needed
    if (changes) {
      const value = !this.updatePipeEvent$.getValue();
      this.updatePipeEvent$.next(value);
      this._setDateValues();
      this._cdr.detectChanges();
    }
  }

  public onChange(e: any): void {
    if (this.options.checkboxCB) {
      this.options.checkboxCB(e, this.options.index, this.options.row);
    }
    this.checkboxChanged.emit();
  }

  public itemClick(): void {
    if (this.options.rowClick && this.options.rowClick?.allRowClickable && this.options.rowClick?.condition(this.options.row)) {
      this.options.rowClick.onClickCB(this.options.row);
    }
  }

  private _setDateValues(): void {
    this.dateFormat = this.settingHelperService.getDate()?.formatPipe;
    if (this.options.rightAlign?.transformDate) {
      this.rightAlignDate = this.datePipe.transform(
        this.options.rightAlign.rightAlignText,
        this.options.rightAlign.formatDatePipe
          ? this.settingHelperService.getDate()[this.options.rightAlign.formatDatePipe as keyof DateFormat]
          : this.dateFormat
      ) as any;
      this._cdr.markForCheck();
    }

    if (this.options.subRightAlign?.transformDate) {
      this.subRightAlignDate = this.datePipe.transform(
        this.options.subRightAlign.subRightAlignText,
        this.options.subRightAlign.formatDatePipe
          ? this.settingHelperService.getDate()[this.options.subRightAlign.formatDatePipe as keyof DateFormat]
          : this.dateFormat
      ) as any;
      this._cdr.markForCheck();
    }

    this.options.labelValue = this.options.labelValue?.map(item => {
      if (item.transformDate) {
        this._cdr.markForCheck();

        return {
          ...item,
          date: this.datePipe.transform(
            item.row[item.key],
            item.formatDatePipe ? this.settingHelperService.getDate()[item.formatDatePipe as keyof DateFormat] : this.dateFormat
          )
        };
      } else {
        return item;
      }
    });

    this.options.rowTable = this.options.rowTable?.map(item => {
      if (item.transformDate) {
        this._cdr.markForCheck();

        return {
          ...item,
          date: this.datePipe.transform(
            item.row[item.key],
            item.formatDatePipe ? this.settingHelperService.getDate()[item.formatDatePipe as keyof DateFormat] : this.dateFormat
          )
        };
      } else {
        return item;
      }
    });
  }
}
