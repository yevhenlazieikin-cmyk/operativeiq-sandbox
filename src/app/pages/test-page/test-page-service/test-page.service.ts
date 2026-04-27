import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface OperationDetails {
  operationId: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
}

export interface AssignmentInfo {
  assignedTo: string;
  team: string;
  location: string;
  contact: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class TestPageService {
  getOperationDetails(): Observable<OperationDetails> {
    return of({
      operationId: 'OPR-2024-001',
      status: 'Active',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      priority: 'High',
    });
  }

  getAssignmentInfo(): Observable<AssignmentInfo> {
    return of({
      assignedTo: 'John Smith',
      team: 'Alpha',
      location: 'New York',
      contact: 'john.smith@example.com',
      notes: 'Regular maintenance operation',
    });
  }
}
