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
    path: 'asset-classes',
    loadComponent: () =>
      import('./pages/asset-classes/asset-classes.component').then(
        (m) => m.AssetClassesComponent
      ),
    canActivate: [permissionGuard(PermissionConstants.assetClassesView, false)],
    title: 'Asset Classes',
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
  {
    path: 'unit',
    loadComponent: () =>
      import('./pages/unit/unit.component').then((m) => m.UnitComponent),
    title: 'Unit',
    data: { menuType: 'OPERATION' },
  },
  {
    path: 'work-order',
    loadComponent: () =>
      import('./pages/work-order/work-order.component').then(
        (m) => m.WorkOrderComponent
      ),
    canActivate: [permissionGuard(PermissionConstants.workOrderView, false)],
    title: 'Work Order',
    data: { menuType: 'OPERATION' },
  },
  { path: '**', redirectTo: '' },
];
