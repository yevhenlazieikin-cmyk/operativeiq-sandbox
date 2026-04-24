import { CanActivateFn } from '@angular/router';
import { PermissionEntry } from '../constants/permission.constants';

export function permissionGuard(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _permission: PermissionEntry | PermissionEntry[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _strict = false,
): CanActivateFn {
  return () => true;
}
