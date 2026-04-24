import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
  TemplateRef,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DetailsPanel, FieldConfig, FieldType, menuType } from '@backoffice/shared-ui';
import { QuickFilterGroupItem } from '../../models/quick-filters.interface';
import { GridModule } from '../../grid.module';

@Component({
  selector: 'bo-quick-filters-panel',
  standalone: true,
  imports: [DetailsPanel, GridModule],
  templateUrl: './quick-filters-panel.component.html',
  styleUrls: ['./quick-filters-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickFiltersPanelComponent implements AfterViewInit {
  @ViewChild('quickFiltersTemplate', { static: true }) quickFiltersTemplate!: TemplateRef<any>;

  public filterGroups = input.required<QuickFilterGroupItem[]>();
  public title = input<string>('Quick Filters');
  public userMenu = input(menuType.operation);
  public isExpandable = input<boolean>(false);
  public expandCollapseStorageName = input<string>('');

  private readonly fb = inject(FormBuilder);

  public quickFiltersForm = this.fb.group({
    filters: this.fb.control<null>(null)
  });

  public quickFiltersFields: FieldConfig[] = [];

  ngAfterViewInit(): void {
    this.quickFiltersFields = [
      {
        label: '',
        type: FieldType.CustomTemplate,
        customTemplate: this.quickFiltersTemplate,
        fullWidth: true,
        formControlName: 'filters'
      }
    ];
  }
}
