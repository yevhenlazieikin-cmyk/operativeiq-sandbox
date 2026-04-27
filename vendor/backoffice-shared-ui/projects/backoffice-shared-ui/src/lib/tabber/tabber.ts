import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { TabItem } from './tabber.interface';
import { menuType } from '../header/menu-type.enum';

@Component({
  selector: 'bo-tabber',
  imports: [MatTabsModule, CommonModule],
  templateUrl: './tabber.html',
  styleUrls: ['./tabber.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tabber {
  public readonly tabs = input<TabItem[]>([]);
  public readonly typeMenu = input<menuType>(menuType.operation);
  public readonly selectedIndex = model<number>(0);
  public readonly tabChange = output<{ index: number; tab: TabItem }>();

  public menuTypeEnum = menuType;

  public onSelectedIndexChanged(index: number): void {
    this.selectedIndex.set(index);
    this.tabChange.emit({
      index,
      tab: this.tabs()[index]
    });
  }
}
