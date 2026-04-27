/** Modules*/
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { InputMaskModule } from '@ngneat/input-mask';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

/** Components*/
import { DatePickerComponent } from '../date-picker/date-picker';
import { SearchDropdown } from '../search-dropdown/search-dropdown';
import { ProgressBar } from '../progress-bar/progress-bar';
import { GridComponent } from './grid.component';
import { GridFiltersComponent } from './components/grid-filters/grid-filters.component';
import { SortingDropdownComponent } from './components/sorting-dropdown/sorting-dropdown.component';
import { InfiniteScrollComponent } from './components/infinite-scroll/infinite-scroll.component';
import { CollapsedGridComponent } from './components/collapsed-grid/collapsed-grid.component';
import { GridCellComponent } from './components/grid-cell/grid-cell.component';
import { GridCellTemplateComponent } from './components/grid-cell-template/grid-cell-template.component';
import { MobGridTileComponent } from './components/mob-grid-tile/mob-grid-tile.component';
import { MobileFiltersComponent } from './components/mobile-filters/mobile-filters.component';
import { FilterSelectComponent } from './components/filter-select/filter-select.component';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';
import { InfoTooltipComponent } from '../info-tooltip/info-tooltip.component';
import { CounterComponent } from '../counter/counter.component';
import { FilterInputComponent } from './components/filter-input/filter-input.component';
import { FilterDateComponent } from './components/filter-date/filter-date.component';
import { GridPaginationComponent } from './components/pagination/pagination.component';
import { QuickFiltersComponent } from './components/quick-filters/quick-filters.component';

/** Directives*/
import {
  GridCellDirective,
  MobViewTypeDirective,
  AdDirective,
  InputSanitizerDirective,
  StickyHeaderGroupDirective,
  StickyHeaderDirective,
  NextInputFocusDirective,
  RippleOnhoverDirective
} from './directives';

/** Pipes*/
import { SetRibbonStatusPipe, DynamicPipe, SetClassFromTemplatePipe, CallTemplateExpressionPipe } from './pipes';
import { SeparatorPipe } from '../shared/pipes/separator.pipe';

/** Services*/
import {
  ClientFilterSortingService,
  FilterSelectService,
  FilterService,
  MobileFiltersFocusService,
  ServerFilterSortingService,
  CreateTemplateWithOverlayService,
  UpdatePaginationService,
  GridHelperService
} from './services';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { AutoSelectDirective } from '@backoffice/shared-ui/lib/grid/directives/auto-select.directive';
import { CustomDateUtcPipe } from '@backoffice/shared-ui/lib/pipes/custom-date-utc-pipe';

@NgModule({
  declarations: [
    /** Components*/
    GridComponent,
    GridFiltersComponent,
    MobileFiltersComponent,
    CollapsedGridComponent,
    GridCellComponent,
    MobGridTileComponent,
    GridCellTemplateComponent,
    SortingDropdownComponent,
    InfiniteScrollComponent,
    FilterSelectComponent,
    FilterDialogComponent,
    FilterInputComponent,
    FilterDateComponent,
    GridPaginationComponent,
    QuickFiltersComponent,
    /** Pipes*/
    SetRibbonStatusPipe,
    CallTemplateExpressionPipe,
    SetClassFromTemplatePipe,
    DynamicPipe,
    /** Directives*/
    StickyHeaderDirective,
    GridCellDirective,
    MobViewTypeDirective,
    AdDirective,
    StickyHeaderGroupDirective,
    InputSanitizerDirective,
    NextInputFocusDirective,
    RippleOnhoverDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DatePickerComponent,
    SearchDropdown,
    ProgressBar,
    MatSelectModule,
    MatCheckboxModule,
    MatSortModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatRippleModule,
    MatIconModule,
    MatButtonModule,
    InputMaskModule,
    OverlayscrollbarsModule,
    MatPaginatorModule,
    InfoTooltipComponent,
    CounterComponent,
    SeparatorPipe,
    SvgIconComponent,
    AutoSelectDirective,
    CustomDateUtcPipe,
    NgOptimizedImage
  ],
  exports: [
    GridComponent,
    CollapsedGridComponent,
    GridCellComponent,
    GridCellDirective,
    StickyHeaderGroupDirective,
    MobGridTileComponent,
    QuickFiltersComponent,
    SeparatorPipe,
    RippleOnhoverDirective
  ],
  providers: [
    ClientFilterSortingService,
    ServerFilterSortingService,
    FilterService,
    FilterSelectService,
    MobileFiltersFocusService,
    CreateTemplateWithOverlayService,
    UpdatePaginationService,
    GridHelperService
  ]
})
export class GridModule {}
