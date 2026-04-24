import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem } from '../menu-item.interface';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  getMenuItemList(menuListUrl: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${menuListUrl}/Menu`);
  }
}
