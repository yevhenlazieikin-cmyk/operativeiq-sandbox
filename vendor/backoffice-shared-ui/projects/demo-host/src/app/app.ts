import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';

import {
  ActionButton,
  ActionButtonsPanel,
  BaseSelectEntityDialog,
  ConfigurableDialog,
  CounterComponent,
  DetailsPanel,
  FieldConfig,
  FieldType,
  InfoTooltipComponent,
  // Tabber, TabItem,
  ProgressBar, // ProgressBarMode,
  Layout,
  SharedCommunication,
  TimePicker,
  GenericSortDialog,
  MultipleSelectEntityDialog,
  ActionButtonSubPanel
} from '@backoffice/shared-ui';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { FilterData } from '@backoffice/shared-ui/lib/grid/models';
import { GridCellType, MobGridTileType } from '@backoffice/shared-ui/lib/grid/enum';
import { CommentsPanelPreview } from './pages/comments-panel-preview/comments-panel-preview';
import { NotificationsService } from '@backoffice/shared-ui/lib/services/notifications.service';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { SvgsMergeService } from '@backoffice/shared-ui/lib/services/svgs-merge.service';
import { svgs } from '../../assets/images/icon';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Layout,
    ActionButtonsPanel,
    DetailsPanel,
    ProgressBar,
    MatButtonToggleModule,
    MatTooltipModule,
    MatButton,
    RouterLink,
    RouterLinkActive,
    TimePicker,
    CounterComponent,
    InfoTooltipComponent,
    CommentsPanelPreview,
    ActionButtonSubPanel,
    SvgIconComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  public timeFormat = '12' as '12' | '24';
  public timeValue = '05:15 PM';
  public headerDataUrl = ''; // need provide link for environment
  public headerLinksDataUrl = ''; // need provide link for environment

  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationsService);
  private readonly sharedCommunication = inject(SharedCommunication);
  private readonly svgsMergeService = inject(SvgsMergeService);

  public readonly successMessage = signal<string>('Success Message');
  public readonly shortErrorMessage = signal<string>('Error Message');
  public readonly longErrorMessage = signal<string>(
    'Input Validation Error: The provided string length is invalid. ' +
      'The input parameter requires a maximum length of 200 characters. ' +
      'The current length exceeds this threshold, preventing successful processing.' +
      'Please truncate the input and resubmit the request.'
  );

  protected readonly title = signal('demo-host');

  // Tabber
  // tabItems: TabItem[] = [
  //   { label: 'General', content: 'General content' },
  //   { label: 'Details', content: 'Details content', disabled: true },
  //   { label: 'Settings', content: 'Settings content' }
  // ];

  // Action Buttons Panel
  actionButtons: ActionButton[] = [
    { name: 'Save', actionCB: () => alert('Save clicked') },
    { name: 'Apply', actionCB: () => alert('Apply clicked') }
  ];

  // Details Panel
  detailsFields: FieldConfig[] = [
    { type: FieldType.TextField, label: 'Name', formControlName: 'name' },
    {
      type: FieldType.DatePicker,
      label: 'Date',
      formControlName: 'date',
      hint: 'Date from',
      customRequiredValidationMessage: 'Date from is required and should be after 2000'
    },
    {
      type: FieldType.Select,
      label: 'CitySearch',
      formControlName: 'citySearch',
      options: [
        { label: 'New York', value: '1' },
        { label: 'Los Angeles', value: '2' },
        { label: 'Chicago', value: '3' }
      ]
    },
    { type: FieldType.TextArea, label: 'Notes', formControlName: 'notes', maxLength: 500 },
    {
      type: FieldType.TimePicker,
      label: 'Time',
      formControlName: 'time',
      timeFormat: '24'
    }
  ];
  readonly subModulesForm = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control<string>('', { validators: [Validators.required, Validators.maxLength(50)] }),
    date: this.fb.nonNullable.control<Date>(moment().toDate(), { validators: [Validators.required] }),
    citySearch: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    notes: this.fb.nonNullable.control<string>('', { validators: [Validators.maxLength(500)] }),
    time: this.fb.nonNullable.control<string>({ value: '17:18', disabled: false }, { validators: [Validators.required] })
  });

  // public progressBarMode = ProgressBarMode.INDETERMINATE;

  public ngOnInit(): void {
    this.svgsMergeService.svgs = svgs;
    // Test communication between different apps under one domain
    this.sharedCommunication.on('LastBloodCoolerSelectedId', data => {
      console.log('LastBloodCoolerSelectedId', data);
    });

    setTimeout(() => {
      this.sharedCommunication.send('broadcastKey', { id: 2, name: 'test2' });
      this.sharedCommunication.send('LastBloodCoolerSelectedId', 555, true);
      this.sharedCommunication.writeToDB('LastBloodCoolerSelectedId', { id: 555 });
    }, 30000);

    this.sharedCommunication.readFromDB('LastBloodCoolerSelectedId').then(val => console.log(val));
    this.notificationService.resetMessageOnRouteChange(['']);
  }

  // Configurable Dialog
  openDialog() {
    const ref = this.dialog.open(ConfigurableDialog, {
      width: '560px',
      data: {
        title: 'Configurable dialog',
        fields: this.detailsFields,
        form: this.subModulesForm,
        buttons: ['save', 'cancel']
      }
    });

    ref.componentInstance.validationMessage = 'Validation message';

    ref.afterClosed().subscribe(result => {
      console.log('dialog closed:', result);
    });
  }

  openEntityDialog() {
    const filterDataSR: FilterData = {
      filterHeader: 'Filter Supply Rooms',
      sortOptions: {
        default: {
          key: 'roomName',
          direction: 'asc'
        }
      },
      inputs: [
        {
          label: 'Supply Room',
          type: 1,
          value: '',
          name: 'roomName',
          dataType: 'string',
          hasSorting: true,
          style: { width: '50%' }
        },
        {
          label: 'Kit Room',
          type: 1,
          value: '',
          name: 'division',
          dataType: 'string',
          hasSorting: true,
          style: { width: '50%' }
        }
      ]
    };
    const ref = this.dialog.open(BaseSelectEntityDialog, {
      width: '560px',
      maxHeight: '700px',
      data: {
        gridType: 'CLIENT',
        title: 'Select Supply Room',
        gridOptions: {
          items: [
            {
              id: '1',
              roomName: 'Room first',
              division: 'Test 1'
            },
            {
              id: '2',
              roomName: 'Room second',
              division: 'Test 2'
            },
            {
              id: '3',
              roomName: 'Room third',
              division: 'Test 3'
            },
            {
              id: '4',
              roomName: 'Room forth',
              division: 'Test 4'
            },
            {
              id: '5',
              roomName: 'Room fifth',
              division: 'Test 5'
            },
            {
              id: '6',
              roomName: 'Room six',
              division: 'Test 6'
            },
            {
              id: '7',
              roomName: 'Room seven',
              division: 'Test 7'
            }
          ],
          activeItem: 5,
          filterData: filterDataSR,
          scrollWindow: false,
          infiniteScroll: false,
          mobileFilterCondition: false,
          searchEnum: 'roomName',
          cellSchema: {
            mainRow: [
              {
                type: GridCellType.readonlyText,
                key: 'roomName',
                classList: ['semi-bold-font'],
                mobView: {
                  type: MobGridTileType.mainTitle
                }
              },
              {
                type: GridCellType.readonlyText,
                key: 'division',
                classList: ['semi-bold-font'],
                mobView: {
                  type: MobGridTileType.mainTitle
                }
              }
            ]
          }
        },
        selectButtonTitle: 'Select',
        cancelButtonHidden: false,
        classList: ['select-room-modal', 'inspections-background']
      }
    });
    ref.componentInstance.validationMessage = 'Validation message';
    ref.afterClosed().subscribe(result => {
      console.log('dialog closed:', result);
    });
  }

  openGenericSortDialog() {
    const filterDataSR: FilterData = {
      filterHeader: 'Filter Supply Rooms',
      sortOptions: {
        default: {
          key: 'name',
          direction: 'asc'
        }
      },
      inputs: [
        {
          label: 'Supply Room',
          type: 5,
          value: '',
          name: 'name',
          dataType: 'string',
          hasSorting: true,
          style: { width: '47%' }
        },
        {
          label: 'Kit Room',
          type: 5,
          value: '',
          name: 'division',
          dataType: 'string',
          hasSorting: false,
          style: { width: '47%' }
        }
      ]
    };
    const ref = this.dialog.open(GenericSortDialog, {
      width: '560px',
      disableClose: true,
      panelClass: 'modal',
      data: {
        tableDescription: 'some text',
        gridType: 'CLIENT',
        menuTypeButtons: 'OPERATION',
        title: 'Select Supply Room',
        gridOptions: {
          items: [
            {
              id: '1',
              name: 'Room A',
              division: 'Test 1'
            },
            {
              id: '2',
              name: 'Room B',
              division: 'Test 2'
            },
            {
              id: '3',
              name: 'Room C',
              division: 'Test 3'
            },
            {
              id: '4',
              name: 'Room D',
              division: 'Test 4'
            },
            {
              id: '5',
              name: 'Room E',
              division: 'Test 5'
            },
            {
              id: '6',
              name: 'Room F',
              division: 'Test 6'
            },
            {
              id: '7',
              name: 'Room G',
              division: 'Test 7'
            }
          ],
          activeItem: 5,
          filterData: filterDataSR,
          scrollWindow: false,
          infiniteScroll: true,
          outerService: true,
          mobileFilterCondition: false,
          mobileSortingCondition: false,
          filtersIncluded: false,
          searchEnum: 'name',
          cellSchema: {
            mainRow: [
              {
                type: GridCellType.readonlyText,
                key: 'name',
                classList: ['semi-bold-font'],
                mobView: {
                  type: MobGridTileType.mainTitle
                }
              },
              {
                type: GridCellType.readonlyText,
                key: 'division',
                classList: ['semi-bold-font'],
                mobView: {
                  type: MobGridTileType.mainTitle
                }
              }
            ]
          }
        },
        allowSort: {
          sort: true,
          sortByColumnName: 'name'
        },
        selectButtonTitle: 'Select',
        cancelButtonHidden: false,
        primaryButtonHidden: false,
        sortColumnName: 'ordering',
        classList: ['select-room-modal', 'inspections-background']
      }
    });
    ref.componentInstance.validationMessage =
      'Validation message Validation message Validation message Validation message Validation message Validation message Validation message Validation message Validation message Validation message Validation message Validation message Validation message ';

    ref.afterClosed().subscribe(result => {
      console.log('dialog closed: ', result);
    });

    ref.componentInstance.appliedValue.subscribe(result => {
      console.log('applied value without close dialog: ', result);
    });
  }

  openMultiSelectDialog() {
    const filterDataSR: FilterData = {
      filterHeader: 'Filter Supply Rooms',
      sortOptions: {
        default: {
          key: 'name',
          direction: 'asc'
        }
      },
      inputs: [
        {
          label: '',
          type: 5,
          value: '',
          name: 'id',
          dataType: 'string',
          hasSorting: false,
          style: { width: '6%' }
        },
        {
          label: 'Supply Room',
          type: 5,
          value: '',
          name: 'name',
          dataType: 'string',
          hasSorting: true,
          style: { width: '47%' }
        },
        {
          label: 'Kit Room',
          type: 5,
          value: '',
          name: 'division',
          dataType: 'string',
          hasSorting: false,
          style: { width: '47%' }
        }
      ]
    };
    const ref = this.dialog.open(MultipleSelectEntityDialog, {
      width: '560px',
      maxHeight: '700px',
      disableClose: true,
      data: {
        gridType: 'CLIENT',
        title: 'Select Supply Room',
        hasMasterCheckbox: true,
        menuTypeButtons: 'OPERATION',
        gridOptions: {
          items: [
            {
              id: '1',
              name: 'Room A',
              division: 'Test 1'
            },
            {
              id: '2',
              name: 'Room B',
              division: 'Test 2'
            },
            {
              id: '3',
              name: 'Room C',
              division: 'Test 3'
            },
            {
              id: '4',
              name: 'Room D',
              division: 'Test 4'
            },
            {
              id: '5',
              name: 'Room E',
              division: 'Test 5'
            },
            {
              id: '6',
              name: 'Room F',
              division: 'Test 6'
            },
            {
              id: '7',
              name: 'Room G',
              division: 'Test 7'
            }
          ],
          activeItem: 5,
          filterData: filterDataSR,
          scrollWindow: false,
          infiniteScroll: false,
          mobileFilterCondition: false,
          mobileSortingCondition: false,
          filtersIncluded: false,
          searchEnum: 'name',
          cellSchema: {
            mainRow: [
              {
                type: GridCellType.checkboxText,
                key: 'selected',
                classList: ['semi-bold-font'],
                mobView: {
                  type: MobGridTileType.mainTitle
                }
              },
              {
                type: GridCellType.readonlyText,
                key: 'name',
                classList: ['semi-bold-font'],
                mobView: {
                  type: MobGridTileType.mainTitle
                }
              },
              {
                type: GridCellType.readonlyText,
                key: 'division',
                classList: ['semi-bold-font'],
                mobView: {
                  type: MobGridTileType.mainTitle
                }
              }
            ]
          }
        },
        allowSort: {
          sort: true,
          sortByColumnName: 'name'
        },
        selectButtonTitle: 'Select',
        cancelButtonHidden: false,
        primaryButtonHidden: false,
        sortColumnName: 'ordering',
        classList: ['select-room-modal', 'inspections-background']
      }
    });

    ref.componentInstance.validationMessage = 'validation message';

    ref.afterClosed().subscribe(result => {
      console.log('dialog closed: ', result);
    });
  }

  public actionPanelButtons = [
    {
      label: 'Validation',
      state: false,
      action: this.validationButtonAction
    },
    {
      label: 'Submit',
      state: false,
      action: this.submitButtonAction
    }
  ];

  private validationButtonAction(data: any) {
    console.log('click validationButtonAction', data);
  }

  private submitButtonAction() {
    console.log('click submitButtonAction');
  }

  handleGridRoute(data: string) {
    if (data === 'client') this.router.navigate(['client-grid']);
    if (data === 'server') this.router.navigate(['server-grid']);
  }

  public showMessage(msg: string, error: boolean = false): void {
    this.notificationService.setMessage(msg, error);
  }

  public resetMessage(): void {
    this.notificationService.resetMessage();
  }
}
