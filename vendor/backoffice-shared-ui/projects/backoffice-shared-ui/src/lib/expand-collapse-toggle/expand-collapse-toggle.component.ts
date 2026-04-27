import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlideToggle } from '../slide-toggle/slide-toggle';
import { ExpandCollapseService } from '../services/expand-collapse.service';

@Component({
  selector: 'bo-expand-collapse-toggle',
  imports: [SlideToggle, FormsModule],
  templateUrl: './expand-collapse-toggle.component.html',
  styleUrl: './expand-collapse-toggle.component.scss'
})
export class ExpandCollapseToggle {
  private readonly expandCollapseService = inject(ExpandCollapseService);
  public storageName = input<string>('');

  public get isExpanded(): boolean {
    return this.expandCollapseService.getIsExpanded(this.storageName());
  }

  public set isExpanded(value: boolean) {
    this.expandCollapseService.setIsExpanded(value, this.storageName());
  }
}
