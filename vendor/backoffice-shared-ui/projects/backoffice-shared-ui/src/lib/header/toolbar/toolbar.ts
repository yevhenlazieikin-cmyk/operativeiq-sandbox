import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  input,
  output,
  QueryList,
  signal,
  ViewChildren,
  ChangeDetectorRef,
  effect
} from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MenuService } from '../menu-service/menu-items.service';
import { MenuItem } from '../menu-item.interface';
import { menuType } from '../menu-type.enum';
import { AI_AGENT_PRESELECT_DELAY } from '../../services/ai-agent/ai-agent.constants';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { AiContextService } from '../../services/ai-agent/ai-context.service';

const SUB_ELEMENT_WIDTH = 85;

@Component({
  selector: 'bo-toolbar',
  imports: [NgStyle, MatIconModule, NgClass, SvgIconComponent, RouterLink, RouterLink],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Toolbar implements OnInit {
  public dataSourceUrl = input.required<string>();
  public appUrl = input.required<string>();
  public readonly menuName = output<menuType>();

  public initialMenuType = input<menuType>();
  public toolbarData = signal<MenuItem[]>([]);
  public operationList = signal<MenuItem[]>([]);
  public administrationList = signal<MenuItem[]>([]);
  public toolbarList = signal<MenuItem[]>([]);
  public displayedChildren = signal<MenuItem[]>([]);
  public operationMenu = signal<boolean>(false);
  public administrationMenu = signal<boolean>(false);
  public selectedIndex: number | null = null;
  public childPosition = { left: 0, width: 0 };
  public currentRoute = signal<string>('');
  public selectedPageCode: string | null = null;

  @ViewChildren('toolbarButton', { read: ElementRef }) buttonRefs!: QueryList<ElementRef>;

  private readonly menuService = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly aiContextService = inject(AiContextService);

  constructor() {
    // Watch for menu type changes and update toolbar
    effect(() => {
      const menuTypeValue = this.initialMenuType();
      if (this.toolbarData().length > 0) {
        if (menuTypeValue === menuType.operation) {
          this.operationMenu.set(true);
          this.administrationMenu.set(false);
          this.toolbarList.set(this.operationList());
          this.resetSelectionState();
          this.menuName.emit(menuType.operation);
        } else {
          this.administrationMenu.set(true);
          this.operationMenu.set(false);
          this.toolbarList.set(this.administrationList());
          this.resetSelectionState();
          this.menuName.emit(menuType.administration);
        }
      }
    });
  }

  ngOnInit() {
    this.setDataForToolbar();
    this.updateCurrentRoute();

    // Listen to route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateCurrentRoute();
        // Wait a bit to ensure menu data is loaded and menu type is updated
        setTimeout(() => {
          this.preselectChild();
        }, 100);
        this.cdr.markForCheck();
      });
  }

  private updateCurrentRoute(): void {
    this.currentRoute.set(this.router.url);
  }

  /** Strip query/hash so /credentials?x=1 compares to menu path credentials */
  private routePathOnly(url: string): string {
    const path = url.replace(/^\/+/, '');
    const q = path.indexOf('?');
    const h = path.indexOf('#');
    let end = path.length;
    if (q !== -1) end = Math.min(end, q);
    if (h !== -1) end = Math.min(end, h);

    return path.slice(0, end);
  }

  private pathMatchesMenuBase(currentPath: string, basePath: string): boolean {
    if (!basePath) {
      return false;
    }

    return currentPath === basePath || currentPath.startsWith(`${basePath}/`);
  }

  public isChildActive(childUrl: string): boolean {
    const currentUrl = this.currentRoute();
    if (!currentUrl || !childUrl) return false;

    const normalizedCurrent = this.routePathOnly(currentUrl);
    const normalizedChild = this.routePathOnly(childUrl.replace(/^\.\.\//, ''));

    if (this.pathMatchesMenuBase(normalizedCurrent, normalizedChild)) {
      return true;
    }

    // Handle redirects: check if current URL matches the redirected version of child URL
    // e.g., childUrl: "apps/task-list/my-task-list" -> redirected to "my-task-list"
    const regex = new RegExp(`^apps/${this.appUrl()}/`);
    const redirectedChild = normalizedChild.replace(regex, '');
    if (this.pathMatchesMenuBase(normalizedCurrent, redirectedChild)) {
      return true;
    }

    const redirectedCurrent = normalizedCurrent.replace(regex, '');
    if (this.pathMatchesMenuBase(redirectedCurrent, normalizedChild)) {
      return true;
    }

    return false;
  }

  private decodeEntities(str: string): string {
    return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }

  private parseMenuRecursively(menu: MenuItem[]): MenuItem[] {
    return menu.map(item => ({
      ...item,
      PageName: this.decodeEntities(item.PageName),
      Children: item.Children ? this.parseMenuRecursively(item.Children) : []
    }));
  }

  private setDataForToolbar() {
    this.menuService
      .getMenuItemList(this.dataSourceUrl())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(menuList => {
        if (!menuList || menuList.length === 0) {
          return;
        }

        const parsedList = this.parseMenuRecursively(menuList)?.sort((a, b) => a.SortOrder - b.SortOrder) || [];
        this.toolbarData.set(parsedList);
        this.administrationList.set(parsedList.find(i => i.PageCode === 'Administration_Menu')?.Children || []);
        this.operationList.set(parsedList.find(i => i.PageCode === 'Operations_Menu')?.Children || []);

        const initialType = this.initialMenuType();
        if (initialType === menuType.operation) {
          this.operationMenu.set(true);
          this.administrationMenu.set(false);
          this.toolbarList.set(this.operationList());
          this.resetSelectionState();
          this.menuName.emit(menuType.operation);
        } else {
          this.administrationMenu.set(true);
          this.operationMenu.set(false);
          this.toolbarList.set(this.administrationList());
          this.resetSelectionState();
          this.menuName.emit(menuType.administration);
        }
        this.preselectChild();
      });
  }

  public switchToolbar(itemName?: string, index?: number) {
    if (this.operationMenu()) {
      this.operationMenu.set(false);
      this.administrationMenu.set(true);
      this.menuName.emit(menuType.administration);
      this.toolbarList.set(this.administrationList());
      this.displayedChildren.set([]);
      if (itemName) {
        this.selectCorrectElement(itemName, index || 0);
      }

      return;
    }
    if (this.administrationMenu()) {
      this.administrationMenu.set(false);
      this.operationMenu.set(true);
      this.menuName.emit(menuType.operation);
      this.toolbarList.set(this.operationList());
      this.displayedChildren.set([]);
      if (itemName) {
        this.selectCorrectElement(itemName, index || 0);
      }

      return;
    }
  }

  public onSelect(pageCode: string, index: number): void {
    const btn = this.buttonRefs.get(index);
    if (!btn) return;
    let leftPosition: number;

    const btnRect = btn.nativeElement.getBoundingClientRect();
    const containerRect = btn.nativeElement.offsetParent.getBoundingClientRect();

    const total = this.toolbarList().length;
    const children = this.getChildElements(this.toolbarList(), pageCode);
    const totalChildrenWidth = children.length * SUB_ELEMENT_WIDTH;

    if (total <= 3 || index === 0) {
      leftPosition = btnRect.left - containerRect.left;
      this.displayedChildren.set([...children]);
    } else if (index === total - 1) {
      leftPosition = btnRect.left - containerRect.left - totalChildrenWidth + btnRect.width;
      this.displayedChildren.set([...children]);
    } else {
      const mid = Math.floor(children.length / 2);
      const leftOffset = mid * SUB_ELEMENT_WIDTH;
      leftPosition = btnRect.left - containerRect.left - leftOffset;
      const left = children.slice(0, mid);
      const middle = children.length % 2 ? [children[mid]] : [];
      const right = children.slice(mid + middle.length);
      this.displayedChildren.set([...left, ...middle, ...right]);
    }

    this.childPosition = {
      left: leftPosition < 0 ? 40 : leftPosition,
      width: btnRect.width
    };

    this.selectedIndex = index;
    this.selectedPageCode = pageCode;
  }

  public extendUrl(pageUrl: string): string {
    return `../${pageUrl}`;
  }

  public toRouterLink(url: string): string {
    const stripped = url.replace(/^(\.\.\/)+/, '');
    const appPrefix = `apps/${this.appUrl()}/`;

    return `/${stripped.startsWith(appPrefix) ? stripped.slice(appPrefix.length) : stripped}`;
  }

  public isAngularRoute(url: string): boolean {
    if (!url || url.includes('.aspx')) return false;
    const stripped = url.replace(/^(\.\.\/)+/, '');

    return stripped.startsWith(`apps/${this.appUrl()}/`);
  }

  private getChildElements(elements: MenuItem[], pageCode: string): MenuItem[] {
    return elements.find(e => e.PageCode === pageCode)?.Children || [];
  }

  private selectCorrectElement(pageCode: string, index: number) {
    const toolbarElement = this.toolbarList().find(e => e.PageCode === pageCode);
    if (toolbarElement) {
      const foundIndex = this.toolbarList().indexOf(toolbarElement);
      if (foundIndex !== index) {
        setTimeout(() => {
          this.onSelect(pageCode, foundIndex || 0);
        });
      } else {
        this.onSelect(pageCode, index || 0);
      }
    } else {
      this.selectedIndex = null;
    }
  }

  private preselectChild(): void {
    const tabUrl = this.router.url;
    if (tabUrl === '/' || this.toolbarList().length === 0) {
      return;
    }

    // Normalize the current URL - remove leading slash
    const normalizedUrl = tabUrl.replace(/^\/+/, '');

    // First, try to find in the current toolbar list
    let match = this.findItemInList(this.toolbarList(), normalizedUrl);

    // If not found, check opposite list from one in current toolbar and switch context if needed
    if (!match) {
      if (this.operationMenu()) {
        const administrationMatch = this.findItemInList(this.administrationList(), normalizedUrl);
        if (administrationMatch) {
          if (!this.administrationMenu()) {
            this.administrationMenu.set(true);
            this.operationMenu.set(false);
            this.menuName.emit(menuType.administration);
            this.toolbarList.set(this.administrationList());
          }
          match = administrationMatch;
        }
      } else {
        const operationMatch = this.findItemInList(this.operationList(), normalizedUrl);
        if (operationMatch) {
          if (!this.operationMenu()) {
            this.operationMenu.set(true);
            this.administrationMenu.set(false);
            this.menuName.emit(menuType.operation);
            this.toolbarList.set(this.operationList());
          }
          match = operationMatch;
        }
      }
    }

    if (match) {
      this.aiContextService.setModuleName(match.item.PageName);
      setTimeout(() => {
        this.onSelect(match.item.PageCode, match.index);
        this.selectedIndex = match.index;
        this.cdr.detectChanges();
      }, AI_AGENT_PRESELECT_DELAY);
    }
  }

  private findItemInList(list: MenuItem[], normalizedUrl: string): { item: MenuItem; index: number } | undefined {
    let result: { item: MenuItem; index: number } | undefined;

    list.some((item, index) => {
      const hasMatch = item.Children?.some(child => {
        if (!child.PageUrl) return false;

        // Normalize child URL - remove leading slash and ../ prefix
        const normalizedChildUrl = child.PageUrl.replace(/^\/+/, '').replace(/^\.\.\//, '');

        // Check direct match
        if (normalizedUrl === normalizedChildUrl || normalizedUrl.includes(normalizedChildUrl)) {
          return true;
        }

        // Handle redirects: check if current URL matches the redirected version of child URL
        // e.g., childUrl: "apps/task-list/task-list-summary" -> redirected to "task-list-summary"
        const regex = new RegExp(`^apps/${this.appUrl()}/`);
        const redirectedChild = normalizedChildUrl.replace(regex, '');
        if (normalizedUrl === redirectedChild || normalizedUrl.includes(redirectedChild)) {
          return true;
        }

        // Also check reverse: if current has "apps/task-list/" prefix, check against child without it
        const redirectedCurrent = normalizedUrl.replace(regex, '');
        if (redirectedCurrent === normalizedChildUrl || redirectedCurrent.includes(normalizedChildUrl)) {
          return true;
        }

        return false;
      });

      if (hasMatch) {
        result = { item, index };

        return true;
      }

      return false;
    });

    return result;
  }

  private resetSelectionState(): void {
    this.displayedChildren.set([]);
    this.selectedIndex = null;
    this.selectedPageCode = null;
    this.childPosition = { left: 0, width: 0 };
  }
}
