import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

interface UpdatePagination {
  currentPage: number;
  previousPage: number;
  rowsPerPage: number;
}

@Injectable()
export class UpdatePaginationService {
  public paginationData$ = new ReplaySubject<UpdatePagination>(1);
}
