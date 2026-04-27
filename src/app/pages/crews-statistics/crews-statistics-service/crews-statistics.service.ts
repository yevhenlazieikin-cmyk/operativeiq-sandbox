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
      { id: 7, name: 'Taylor Young', role: 'Lieutenant', station: 'Station 4', country: 'UK', tasksCompleted: 36, avgResponseTimeMin: 8.4 },
      { id: 8, name: 'Riley Nakamura', role: 'Paramedic', station: 'Station 6', country: 'Japan', tasksCompleted: 48, avgResponseTimeMin: 6.4 },
      { id: 9, name: 'Devon Sokolov', role: 'Engineer', station: 'Station 8', country: 'Poland', tasksCompleted: 29, avgResponseTimeMin: 8.7 },
      { id: 10, name: 'Avery Dubois', role: 'Firefighter', station: 'Station 2', country: 'France', tasksCompleted: 33, avgResponseTimeMin: 7.9 },
      { id: 11, name: 'Harper Andersson', role: 'Captain', station: 'Station 10', country: 'Sweden', tasksCompleted: 52, avgResponseTimeMin: 6.5 },
      { id: 12, name: 'Quinn Romero', role: 'Lieutenant', station: 'Station 11', country: 'Spain', tasksCompleted: 38, avgResponseTimeMin: 7.6 },
      { id: 13, name: 'Cameron O\'Brien', role: 'Paramedic', station: 'Station 4', country: 'Ireland', tasksCompleted: 44, avgResponseTimeMin: 6.9 },
      { id: 14, name: 'Skyler Hassan', role: 'Engineer', station: 'Station 12', country: 'UAE', tasksCompleted: 27, avgResponseTimeMin: 9.3 },
      { id: 15, name: 'Reese Lindqvist', role: 'Firefighter', station: 'Station 13', country: 'Norway', tasksCompleted: 35, avgResponseTimeMin: 8.0 },
      { id: 16, name: 'Drew Kowalski', role: 'Captain', station: 'Station 14', country: 'Poland', tasksCompleted: 49, avgResponseTimeMin: 6.7 },
      { id: 17, name: 'Sage Ferreira', role: 'Lieutenant', station: 'Station 15', country: 'Brazil', tasksCompleted: 32, avgResponseTimeMin: 8.1 },
      { id: 18, name: 'Rowan Esposito', role: 'Paramedic', station: 'Station 6', country: 'Italy', tasksCompleted: 51, avgResponseTimeMin: 6.3 },
      { id: 19, name: 'Phoenix Kapoor', role: 'Engineer', station: 'Station 16', country: 'India', tasksCompleted: 25, avgResponseTimeMin: 9.5 },
      { id: 20, name: 'Hayden Park', role: 'Firefighter', station: 'Station 17', country: 'South Korea', tasksCompleted: 40, avgResponseTimeMin: 7.4 },
      { id: 21, name: 'Emerson Vasquez', role: 'Captain', station: 'Station 18', country: 'Mexico', tasksCompleted: 46, avgResponseTimeMin: 6.6 },
      { id: 22, name: 'Sutton Brennan', role: 'Lieutenant', station: 'Station 8', country: 'Australia', tasksCompleted: 37, avgResponseTimeMin: 7.8 },
      { id: 23, name: 'Marlowe Iversen', role: 'Paramedic', station: 'Station 19', country: 'Denmark', tasksCompleted: 53, avgResponseTimeMin: 6.0 },
      { id: 24, name: 'Blake Travers', role: 'Engineer', station: 'Station 5', country: 'UK', tasksCompleted: 30, avgResponseTimeMin: 8.6 },
      { id: 25, name: 'Indigo Marchetti', role: 'Firefighter', station: 'Station 20', country: 'Italy', tasksCompleted: 34, avgResponseTimeMin: 8.3 }
    ]);
  }
}
