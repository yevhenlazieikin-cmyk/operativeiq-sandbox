import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
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
  menuType,
} from '@backoffice/shared-ui';
import { TestPageService } from './test-page-service/test-page.service';

@Component({
  selector: 'app-test-page',
  imports: [ActionButtonsPanel, DetailsPanel, Footer, ReactiveFormsModule],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestPageComponent {
  protected readonly menuType = menuType;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TestPageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly operationForm: FormGroup = this.fb.group({
    operationId: [''],
    status: [''],
    startDate: [''],
    endDate: [''],
    priority: [''],
  });

  protected readonly operationFields: FieldConfig[] = [
    { label: 'Operation ID', type: FieldType.ReadOnly, formControlName: 'operationId' },
    { label: 'Status', type: FieldType.ReadOnly, formControlName: 'status' },
    { label: 'Start Date', type: FieldType.ReadOnly, formControlName: 'startDate' },
    { label: 'End Date', type: FieldType.ReadOnly, formControlName: 'endDate' },
    { label: 'Priority', type: FieldType.ReadOnly, formControlName: 'priority' },
  ];

  protected readonly assignmentForm: FormGroup = this.fb.group({
    assignedTo: [''],
    team: [''],
    location: [''],
    contact: [''],
    notes: [''],
  });

  protected readonly assignmentFields: FieldConfig[] = [
    { label: 'Assigned To', type: FieldType.ReadOnly, formControlName: 'assignedTo' },
    { label: 'Team', type: FieldType.ReadOnly, formControlName: 'team' },
    { label: 'Location', type: FieldType.ReadOnly, formControlName: 'location' },
    { label: 'Contact', type: FieldType.ReadOnly, formControlName: 'contact' },
    { label: 'Notes', type: FieldType.ReadOnly, formControlName: 'notes' },
  ];

  protected readonly actionButtons: ActionButton[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.service
      .getOperationDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.operationForm.patchValue(data));

    this.service
      .getAssignmentInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.assignmentForm.patchValue(data));
  }
}
