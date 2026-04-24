import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  TemplateRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FieldType } from './field-type.enum';
import { CustomHeaderButton, FieldConfig } from './field-config.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { SearchDropdown } from '../search-dropdown/search-dropdown';
import { DatePickerComponent } from '../date-picker/date-picker';
import { menuType } from '../header/menu-type.enum';
import { MessageService } from '../services/messages.service';
import { FieldPropertyPipe } from '../shared/pipes/field-property.pipe';
import { SlideToggle } from '../slide-toggle/slide-toggle';
import { TimePicker } from '../time-picker/time-picker';
import { ResolveErrorMessagePipe } from '../shared/pipes/resolve-error-data.pipe';
import { AbsoluteDivPopoutDirective } from '@backoffice/shared-ui/lib/error-message/right-side-lug.directive';
import { TruncatePipe } from '../shared/pipes/truncate-pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomDateUtcPipe } from '@backoffice/shared-ui/lib/pipes/custom-date-utc-pipe';
import { CURRENT_TIMEZONE } from '@backoffice/shared-ui/lib/shared/tokens/current-timezone.token';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { SettingHelperService } from '../grid/services/setting-helper.service';
import { CollapsableContentDirective, ExpandCollapseDirective, StaticContentDirective } from '../directives/expand-collapse.directive';
import { BoFormSubmitDirective } from '../directives/form-submit.directive';
import { FormValidationService } from '../services/form-validation.service';

@Component({
  selector: 'bo-details-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    SearchDropdown,
    DatePickerComponent,
    FieldPropertyPipe,
    SlideToggle,
    TimePicker,
    ResolveErrorMessagePipe,
    AbsoluteDivPopoutDirective,
    DatePipe,
    TruncatePipe,
    MatTooltipModule,
    CustomDateUtcPipe,
    SvgIconComponent,
    ExpandCollapseDirective,
    StaticContentDirective,
    CollapsableContentDirective,
    BoFormSubmitDirective
  ],
  templateUrl: './details-panel.html',
  styleUrl: './details-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsPanel implements OnDestroy {
  private static nextFormInstanceId = 0;
  private readonly formInstanceId = DetailsPanel.nextFormInstanceId++;

  public form = input.required<FormGroup>();
  public fields = input.required<FieldConfig[]>();
  public title = input('');
  public userMenu = input(menuType.operation);
  public readonly isExpandable = input<boolean>(false);
  public readonly expandCollapseStorageName = input<string>('');
  public emptyStateTemplate = input<TemplateRef<any> | null>(null);
  public actionButtons = input<CustomHeaderButton[] | []>([]);
  public readonly formId = computed(
    () => `bo-details-panel-form-${this.title() ? this.title().toLowerCase().replace(/ /g, '-') : this.formInstanceId}`
  );
  public readonly insideDialog = input<boolean>(false);
  private readonly settingHelperService = inject(SettingHelperService);
  private readonly fvs = inject(FormValidationService);
  public get dateFormat(): string {
    return this.settingHelperService.getDate().formatPipe;
  }
  public get dateTimeFormat(): string {
    return this.settingHelperService.getDate().formatPipeDateTime;
  }

  public fieldTypes = FieldType;
  public menuType = menuType;

  private readonly messageService = inject(MessageService);
  public readonly messages = {
    REQUIRED_FIELD_VALIDATION: this.messageService.get('REQUIRED_FIELD_VALIDATION'),
    DUPLICATED_FIELD_VALIDATION: this.messageService.get('DUPLICATED_FIELD_VALIDATION'),
    RANGE_FIELD_VALIDATION: this.messageService.get('RANGE_FIELD_VALIDATION'),
    PATTERN_FIELD_VALIDATION: this.messageService.get('PATTERN_FIELD_VALIDATION')
  };

  public currentTZ = inject(CURRENT_TIMEZONE);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      const form = this.form();
      if (form) {
        this.destroy$.next();

        form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.cdr.markForCheck();
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public openEntityDialog(field: FieldConfig): void {
    if (field.onEntitySelect) {
      field.onEntitySelect(field);

      if (!field.customClearOnEntitySelect) {
        this.fvs.resetForm(false, [this.formId()]);
      }
    }
  }

  public clearEntity(field: FieldConfig): void {
    if (field.onClear) {
      field.onClear(field);
    }
  }

  public getEntityDisplayText(field: FieldConfig): string {
    const value = this.form().get(field.formControlName)?.value as string;

    if (!value) {
      return field.placeholderLabel || `Select an option`;
    }

    return String(value);
  }

  public handleClick(field: FieldConfig, event: MouseEvent): void {
    if (field.onClick) {
      field.onClick(field, event);
    }
  }

  public onButtonClick(button: CustomHeaderButton): void {
    button.action(this.form());
  }
}
