import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  createdDate: string;
}

// TODO: replace of() stubs with real HTTP calls when backend endpoint is available
// Endpoint: GET ${environment.CLIENT_API}/api/tasks
@Injectable({ providedIn: 'root' })
export class TaskListService {
  getTasks(): Observable<Task[]> {
    return of([
      { id: 1001, title: 'Inspect fire suppression system', status: 'OPEN', priority: 'HIGH', assignee: 'Morgan Patel', dueDate: '2026-05-02', createdDate: '2026-04-18' },
      { id: 1002, title: 'Replace oxygen tank in Unit 4', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Jordan Rivera', dueDate: '2026-04-28', createdDate: '2026-04-20' },
      { id: 1003, title: 'Schedule quarterly crew training', status: 'OPEN', priority: 'MEDIUM', assignee: 'Sam Okafor', dueDate: '2026-05-10', createdDate: '2026-04-21' },
      { id: 1004, title: 'Update emergency contact list', status: 'COMPLETED', priority: 'LOW', assignee: 'Priya Chen', dueDate: '2026-04-22', createdDate: '2026-04-15' },
      { id: 1005, title: 'Calibrate defibrillator units', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Alex Müller', dueDate: '2026-04-30', createdDate: '2026-04-19' },
      { id: 1006, title: 'Restock first-aid kits in Station 3', status: 'OPEN', priority: 'MEDIUM', assignee: 'Morgan Patel', dueDate: '2026-05-05', createdDate: '2026-04-22' },
      { id: 1007, title: 'Review incident report #2041', status: 'COMPLETED', priority: 'MEDIUM', assignee: 'Jordan Rivera', dueDate: '2026-04-20', createdDate: '2026-04-14' },
      { id: 1008, title: 'Audit vehicle maintenance logs', status: 'CANCELLED', priority: 'LOW', assignee: 'Sam Okafor', dueDate: '2026-04-25', createdDate: '2026-04-10' },
    ]);
  }
}
