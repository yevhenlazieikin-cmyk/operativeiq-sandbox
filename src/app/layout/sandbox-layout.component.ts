import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLinkActive, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { routes as rootRoutes } from '../app.routes';

interface NavItem {
  path: string;
  title: string;
}

@Component({
  selector: 'app-sandbox-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sandbox-layout.component.html',
  styleUrl: './sandbox-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxLayoutComponent {
  private readonly router = inject(Router);

  protected readonly navItems = computed<NavItem[]>(() => collectNavItems(rootRoutes));
  protected readonly now = signal(new Date());
}

function collectNavItems(routes: Routes): NavItem[] {
  const result: NavItem[] = [];
  for (const route of routes) {
    if (!route.path || route.path === '**' || route.path.includes(':')) continue;
    const title = typeof route.title === 'string' ? route.title : titleize(route.path);
    result.push({ path: `/${route.path}`, title });
  }
  return result;
}

function titleize(path: string): string {
  if (!path) return 'Home';
  return path
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
