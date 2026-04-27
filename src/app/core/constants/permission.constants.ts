/**
 * Mirrors task-list-fe's permission constants shape. In the sandbox the
 * guard always resolves to `true`, so these values exist mostly to make
 * generated pages compile. Real values are owned by the production backend.
 */
export interface PermissionEntry {
  PageCodes: readonly string[];
}

export const PermissionConstants = {
  homeView: { PageCodes: ['oi_home_view'] } as PermissionEntry,
  homeManage: { PageCodes: ['oi_home_manage'] } as PermissionEntry,
  // needs backend confirmation
  crewsStatisticsView: { PageCodes: ['oi_crews_statistics_view'] } as PermissionEntry,
  crewsStatisticsManage: { PageCodes: ['oi_crews_statistics_manage'] } as PermissionEntry,
  assetClassesView: { PageCodes: ['oi_asset_class_list'] } as PermissionEntry,
  // needs backend confirmation
  assetClassesManage: { PageCodes: ['oi_asset_class_manage'] } as PermissionEntry,
  // needs backend confirmation
  workOrderView: { PageCodes: ['oi_work_order_view'] } as PermissionEntry,
  // needs backend confirmation
  workOrderManage: { PageCodes: ['oi_work_order_manage'] } as PermissionEntry,
} as const;

export type PermissionKey = keyof typeof PermissionConstants;
