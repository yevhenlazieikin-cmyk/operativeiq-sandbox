import { CanActivateFn } from '@angular/router';
import { PermissionEntry } from '../constants/permission.constants';

/**
 * Sandbox shim for task-list-fe's permissionGuard(permission, strict).
 *
 * Production enforces PageCodes against the logged-in user. Inside the
 * sandbox there's no user context, so the guard always allows navigation.
 * This exists only so generated routes with `canActivate: [permissionGuard(...)]`
 * compile unmodified when copied into a real app.
 */
export function permissionGuard(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _permission: PermissionEntry | PermissionEntry[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _strict = false,
): CanActivateFn {
  return () => true;
}
