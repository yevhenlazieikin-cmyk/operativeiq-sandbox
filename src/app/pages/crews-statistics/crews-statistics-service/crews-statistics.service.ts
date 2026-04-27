import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CrewMember {
  id: number;
  name: string;
  role: string;
  station: string;
  country: string;
  tasksCompleted: number;
  avgResponseTimeMin: number;
}

export interface CrewSummary {
  totalCrews: number;
  activeCrews: number;
  inactiveCrews: number;
  totalMembers: number;
  averageCrewSize: number;
}

export interface CrewPerformance {
  tasksCompletedThisMonth: number;
  avgResponseTimeMin: number;
  incidentResolvedRatePct: number;
  trainingCompletionRatePct: number;
}

// TODO: replace of() stubs with real HTTP calls when backend endpoints are available
@Injectable({ providedIn: 'root' })
export class CrewsStatisticsService {
  getSummary(): Observable<CrewSummary> {
    return of({
      totalCrews: 12,
      activeCrews: 8,
      inactiveCrews: 4,
      totalMembers: 47,
      averageCrewSize: 5.9
    });
  }

  getPerformance(): Observable<CrewPerformance> {
    return of({
      tasksCompletedThisMonth: 284,
      avgResponseTimeMin: 7.2,
      incidentResolvedRatePct: 94.6,
      trainingCompletionRatePct: 88.3
    });
  }

  getMembers(): Observable<CrewMember[]> {
    return of([
      { id: 1, name: 'Morgan Patel', role: 'Captain', station: 'Station 3', country: 'USA', tasksCompleted: 47, avgResponseTimeMin: 6.8 },
      { id: 2, name: 'Jordan Rivera', role: 'Lieutenant', station: 'Station 1', country: 'USA', tasksCompleted: 39, avgResponseTimeMin: 7.5 },
      { id: 3, name: 'Sam Okafor', role: 'Paramedic', station: 'Station 7', country: 'Canada', tasksCompleted: 55, avgResponseTimeMin: 6.1 },
      { id: 4, name: 'Priya Chen', role: 'Engineer', station: 'Station 2', country: 'USA', tasksCompleted: 31, avgResponseTimeMin: 8.2 },
      { id: 5, name: 'Alex Müller', role: 'Firefighter', station: 'Station 9', country: 'Germany', tasksCompleted: 22, avgResponseTimeMin: 9.1 },
      { id: 6, name: 'Chris Bennett', role: 'Captain', station: 'Station 5', country: 'USA', tasksCompleted: 41, avgResponseTimeMin: 7.0 },
      { id: 7, name: 'Taylor Young', role: 'Lieutenant', station: 'Station 4', country: 'UK', tasksCompleted: 36, avgResponseTimeMin: 8.4 }
    ]);
  }
}
