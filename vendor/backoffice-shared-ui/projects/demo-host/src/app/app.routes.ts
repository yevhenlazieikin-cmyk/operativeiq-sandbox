import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'server-grid',
    loadComponent: () => import('./pages/server-grid-preview/grid-preview').then(c => c.ServerGridPreview)
  },
  {
    path: 'client-grid',
    loadComponent: () => import('./pages/client-grid-preview/grid-client-preview').then(c => c.ClientGridPreviewComponent)
  },
  {
    path: 'comments-panel',
    loadComponent: () => import('./pages/comments-panel-preview/comments-panel-preview').then(c => c.CommentsPanelPreview)
  }
];
