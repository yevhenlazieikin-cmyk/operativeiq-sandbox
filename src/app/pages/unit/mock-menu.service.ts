import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuItem } from '@backoffice/shared-ui/lib/header/menu-item.interface';
import { navigationMenu } from '@mocks/navigation-menu';

@Injectable()
export class MockMenuService {
  getMenuItemList(_url: string): Observable<MenuItem[]> {
    return of(navigationMenu);
  }
}
