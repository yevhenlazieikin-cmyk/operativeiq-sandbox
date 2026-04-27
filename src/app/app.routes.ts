import { Routes } from '@angular/router';
import { PermissionConstants } from './core/constants/permission.constants';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    canActivate: [permissionGuard(PermissionConstants.homeView, false)],
    title: 'Home',
    data: { menuType: 'OPERATION' },
  },
  {
    path: 'crews-statistics',
    loadComponent: () =>
      import('./pages/crews-statistics/crews-statistics.component').then(
        (m) => m.CrewsStatisticsComponent
      ),
    canActivate: [permissionGuard(PermissionConstants.crewsStatisticsView, false)],
    title: 'Crews Statistics',
    data: { menuType: 'ADMINISTRATION' },
  },
  {
    path: 'task-list',
    loadComponent: () =>
      import('./pages/task-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
    title: 'Task List',
    data: { menuType: 'ADMINISTRATION' },
  },
  {
    path: 'test-page',
    loadComponent: () =>
      import('./pages/test-page/test-page.component').then(
        (m) => m.TestPageComponent
      ),
    title: 'Test Page',
    data: { menuType: 'OPERATION' },
  },
  { path: '**', redirectTo: '' },
];
