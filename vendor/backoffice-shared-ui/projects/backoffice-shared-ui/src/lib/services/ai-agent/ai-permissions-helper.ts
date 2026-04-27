export interface CrewModulePermission {
  TabEnabled: boolean;
  ManageForm: boolean;
  BeEnabled: boolean;
}

export type ModulesPermissions = Record<string, CrewModulePermission>;

export interface UserPolicyPermission {
  Policy: string[];
  Permission: string[];
  Setting: Record<string, boolean>;
}

export const POLICY_AI_AGENT = 'IQ_GENIUS';
export const SETTING_AI_AGENT_ENABLE_BUTTON = 'IQ_Genius_Enable_Button';

export function isAiAgentEnabled(userPolicyPermission: UserPolicyPermission | null | undefined): boolean {
  if (!userPolicyPermission) {
    return false;
  }

  const hasPolicy = userPolicyPermission.Policy?.includes(POLICY_AI_AGENT) ?? false;

  const isButtonEnabled = userPolicyPermission.Setting?.[SETTING_AI_AGENT_ENABLE_BUTTON] === true;

  return hasPolicy && isButtonEnabled;
}

const ALL_MODULES_NAMES = ['Asset', 'Fleet', 'Facility', 'da', 'fu', 'kc'];

const REQUIRED_CODES_FOR_TAB: Record<string, string[]> = {
  Asset: ['oi_asset_maintenance'],
  Fleet: ['oi_fleet_maintenance_edit', 'oi_fleet_maintenance_generic'],
  Facility: ['oi_facility_maintenance']
};

const REQUIRED_CODES_FOR_MANAGE_FORM: Record<string, string[]> = {
  Asset: ['oi_asset_forms', 'oi_asset_form_edit'],
  Fleet: ['oi_fleet_form_list', 'oi_fleet_form_edit'],
  Facility: ['oi_facility_forms', 'oi_facility_form_edit']
};

const REQUIRED_CODES_TO_BE_ENABLED: Record<string, string[]> = {
  da: ['oi_report_manage', 'oi_data_assistant'],
  fu: ['oi_file_assistant'],
  kc: ['oi_knowledge_center_assistant']
};

export function convertPermissionsToModulesPermissions(
  isSuperAdmin: boolean,
  permissionData: UserPolicyPermission | null | undefined
): ModulesPermissions {
  if (!permissionData) {
    return {};
  }

  const permissions = permissionData.Permission || [];

  const modulesPermissions: ModulesPermissions = {};
  const moduleNames = Object.values(ALL_MODULES_NAMES);

  for (const moduleName of moduleNames) {
    const tabCodes = REQUIRED_CODES_FOR_TAB[moduleName] || [];
    const manageFormCodes = REQUIRED_CODES_FOR_MANAGE_FORM[moduleName] || [];
    const toBeEnabledCodes = REQUIRED_CODES_TO_BE_ENABLED[moduleName] || [];

    const tabEnabled = isSuperAdmin ? true : tabCodes.length === 0 || tabCodes.every(code => permissions.includes(code));

    const manageForm = isSuperAdmin ? true : manageFormCodes.length === 0 || manageFormCodes.every(code => permissions.includes(code));

    const beEnabled = isSuperAdmin ? true : toBeEnabledCodes.length === 0 || toBeEnabledCodes.every(code => permissions.includes(code));

    modulesPermissions[moduleName] = {
      TabEnabled: tabEnabled,
      ManageForm: manageForm,
      BeEnabled: beEnabled
    };
  }

  return modulesPermissions;
}
