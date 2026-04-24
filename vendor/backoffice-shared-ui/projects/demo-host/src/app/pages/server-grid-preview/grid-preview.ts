import { ChangeDetectorRef, Component, Inject, inject, Injectable, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

import { LogService } from './log.service';

import { AsyncPipe, CommonModule } from '@angular/common';
import { CustomDateUtcPipe, GridModule } from '@backoffice/shared-ui';
import { FilterData, GridCell } from '@backoffice/shared-ui/lib/grid/models';
import { FilterFieldTypeEnum, GridCellType, MobGridTileType } from '@backoffice/shared-ui/lib/grid/enum';
import { GridHelperService } from '@backoffice/shared-ui/lib/grid/services';
import { CURRENT_TIMEZONE, CurrentTimezoneService } from '@backoffice/shared-ui/lib/shared/tokens/current-timezone.token';

export interface EmsTimeZone {
  id?: number;
  timeZoneName: string;
  abr?: string;
  gmt?: number;
  isServerTimeZone?: boolean;
  status: boolean;
  lastModificationTime?: Date;
  uniqueId?: string;
  createdBy?: number;
  modifiedBy?: number;
  createdTime?: Date;
  timeZoneListId?: number;
  microsoft_TimeZoneName?: string;
  iana_TimeZoneName?: string;
}

@Injectable()
class GridHelperServiceMock {
  constructor(
    //eslint-disable-next-line @angular-eslint/prefer-inject
    @Inject(CURRENT_TIMEZONE) private readonly _currentTZ: CurrentTimezoneService
  ) {}

  public setDefaultTimeZone(): void {
    // const defaultTimezone = this.getDefaultTimezone();
    const defaultTimezone = {
      id: 5,
      timeZoneName: 'Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
      abr: 'EET',
      gmt: 2,
      isServerTimeZone: false,
      status: true,
      lastModificationTime: '2023-03-31T05:11:40.413',
      uniqueId: 'fcda6a97-b4a7-4d7e-ae2e-52d32ab8a944',
      modifiedBy: 1386,
      createdTime: '2016-12-22T13:37:34.183',
      timeZoneListId: 28,
      microsoft_TimeZoneName: 'FLE Standard Time',
      iana_TimeZoneName: 'Europe/Kiev'
    } as any;
    this._currentTZ.currentTz = defaultTimezone;
    // TODO: keep comment to possible use default tx time
    // moment.tz.setDefault(defaultTimezone.iana_TimeZoneName);
  }
  public prepareForFiltering(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }
    const trimStr = str.trim().toLowerCase();

    return this.escapeStr(trimStr);
  }

  public escapeStr(str: string): string {
    let escapeStr = encodeURIComponent(str);
    escapeStr = escapeStr.replace(new RegExp("'", 'g'), "''");

    return escapeStr;
  }
}

@Component({
  selector: 'app-server-server-grid-preview',
  imports: [CommonModule, GridModule, AsyncPipe, CustomDateUtcPipe],
  providers: [
    {
      provide: GridHelperService,
      useClass: GridHelperServiceMock
    }
  ],
  templateUrl: './grid-preview.html',
  styleUrl: './grid-preview.scss'
})
export class ServerGridPreview implements OnInit {
  @ViewChild('timeTempl', { static: true }) public timeTempl!: TemplateRef<any>;
  sortedData: any = [];
  public dataService: any;
  public methodName = '';
  public filterOptions: any = {};
  public mobileFilterQuery: string | null = null;
  public urlParam = 0;
  public timeZone!: EmsTimeZone;
  public customQueryFilter = 'entryDate gt 2025-09-02T15:38:18.015Z';
  public customQuerySingle = '';
  public filterData: FilterData = {
    filterHeader: 'Filter Activity Logs',
    sortOptions: {
      default: {
        key: 'crewName,description',
        direction: 'asc,desc' //multiple sorting directions: direction[index] equals to of the key[index], if there less directions than keys are passed, all keys without direction would have the last direction
      }
    },
    inputs: [
      {
        label: 'Date',
        type: FilterFieldTypeEnum.Date,
        value: '',
        name: 'entryDate',
        dataType: 'date-time',
        hasSorting: true,
        style: { width: '15%' },
        placeholder: 'Date'
      },
      {
        label: 'Time',
        type: FilterFieldTypeEnum.Default,
        name: 'time',
        hasSorting: false,
        style: { width: '25%' }
      },
      {
        label: 'Action',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'description',
        dataType: 'string',
        hasSorting: true,
        style: { width: '40%' }
      },
      {
        label: 'Crew Member',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'crewName',
        dataType: 'string',
        hasSorting: true,
        style: { width: '20%' }
      }
    ]
  };

  public cellSchema: GridCell = {
    mainRow: [
      {
        type: GridCellType.readonlyDate,
        key: 'entryDate',
        mobView: {
          type: MobGridTileType.rightAlignText
        }
      },
      {
        type: GridCellType.customView,
        key: 'time',
        mobView: {
          type: MobGridTileType.subRightAlignText
        }
      },
      {
        type: GridCellType.readonlyText,
        key: 'description',
        classList: ['semi-bold-font'],
        mobView: {
          type: MobGridTileType.mainTitle
        }
      },
      {
        type: GridCellType.readonlyText,
        key: 'crewName',
        mobView: {
          type: MobGridTileType.labelValue,
          mobDef: 'Crew Member',
          order: 1
        }
      }
    ]
  };

  customQueryEvent: Subject<any> = new Subject<any>();
  public filterData$ = new BehaviorSubject<FilterData>(this.filterData);
  public mobileQueryTempKeys = ['crewName'];
  public customDateUtc = CustomDateUtcPipe;

  public cd = inject(ChangeDetectorRef);
  public readonly logService = inject(LogService);
  public readonly gridHelperService = inject(GridHelperService);

  ngOnInit(): void {
    const time = this.cellSchema.mainRow.find(item => item.key === 'time');
    if (time) {
      time.content = this.timeTempl;
    }

    this.timeZone = {
      timeZoneName: 'Eastern Time (US & Canada)',
      abr: 'ET',
      status: true
    };
  }

  newData(data: any) {
    console.log(data);
  }
}
