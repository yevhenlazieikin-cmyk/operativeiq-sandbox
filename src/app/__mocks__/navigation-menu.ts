import { MenuItem } from '@backoffice/shared-ui/lib/header/menu-item.interface';

export const navigationMenu: MenuItem[] = [
  {
    Id: 147,
    PageName: 'Administration Menu',
    PageCode: 'Administration_Menu',
    PageUrl: '#',
    SortOrder: 0,
    Children: [
      {
        Id: 149,
        PageName: 'Purchasing',
        PageCode: 'oi_purchasing_menu',
        PageUrl: '#',
        SortOrder: 5,
        Children: [
          { Id: 150, PageName: 'Approvers', PageCode: 'oi_purchasing_approvers', PageUrl: '../purchasing/Approvers.aspx', SortOrder: 10 },
          { Id: 151, PageName: 'Suppliers', PageCode: 'oi_purchasing_suppliers', PageUrl: '../purchasing/SupplierList.aspx', SortOrder: 15 },
          { Id: 152, PageName: 'GL', PageCode: 'oi_purchasing_general_ledger_list', PageUrl: '../purchasing/GeneralLedgerList.aspx', SortOrder: 20 },
          { Id: 153, PageName: 'Drop Ship<br />Locations', PageCode: 'oi_purchasing_drop_ship_list', PageUrl: '../purchasing/DropShipList.aspx', SortOrder: 25 },
          { Id: 154, PageName: 'Currencies', PageCode: 'oi_currency_list', PageUrl: '../settings/currency.aspx', SortOrder: 30 }
        ]
      },
      {
        Id: 155,
        PageName: 'Inventory',
        PageCode: 'oi_inventory_menu',
        PageUrl: '#',
        SortOrder: 35,
        Children: [
          { Id: 156, PageName: 'Supply<br />Rooms', PageCode: 'oi_supply_room_list', PageUrl: '../rooms/SupplyRoomList.aspx', SortOrder: 40 },
          { Id: 157, PageName: 'Requisition<br />Forms', PageCode: 'oi_req_form_list', PageUrl: '../requests/FormList.aspx', SortOrder: 45 },
          { Id: 158, PageName: 'Kit<br /> Setup', PageCode: 'oi_kit_list', PageUrl: '../kits/KitList.aspx', SortOrder: 50 }
        ]
      },
      {
        Id: 159,
        PageName: 'Assets',
        PageCode: 'oi_part_menu',
        PageUrl: '#',
        SortOrder: 55,
        Children: [
          { Id: 160, PageName: 'Asset<br />Classes', PageCode: 'oi_asset_class_list', PageUrl: '../assets/AssetClassList.aspx', SortOrder: 60 },
          { Id: 161, PageName: 'Maintenance<br />Types', PageCode: 'oi_asset_maintenance_type_list', PageUrl: '../assets/MaintenanceTypeList.aspx', SortOrder: 65 },
          { Id: 162, PageName: 'Forms', PageCode: 'oi_asset_forms', PageUrl: '../assets/FormList.aspx', SortOrder: 70 },
          { Id: 163, PageName: 'Service<br />Providers', PageCode: 'oi_asset_providers', PageUrl: '../assets/ServiceProviderList.aspx', SortOrder: 75 }
        ]
      },
      {
        Id: 164,
        PageName: 'Units',
        PageCode: 'oi_unit_menu',
        PageUrl: '#',
        SortOrder: 80,
        Children: [
          { Id: 165, PageName: 'Fleet<br />Vehicle Types', PageCode: 'oi_fleet_unit_type_list', PageUrl: '../units/UnitFleetTypeList.aspx', SortOrder: 85 },
          { Id: 166, PageName: 'Units', PageCode: 'oi_unit_list', PageUrl: '../units/UnitList.aspx', SortOrder: 90 },
          { Id: 167, PageName: 'Unit<br />Types', PageCode: 'oi_unit_type_list', PageUrl: '../units/UnitTypeList.aspx', SortOrder: 95 },
          { Id: 168, PageName: 'Unit<br />Locations', PageCode: 'oi_unit_location_list', PageUrl: '../units/UnitLocationList.aspx', SortOrder: 100 },
          { Id: 290, PageName: 'Call Signs', PageCode: 'oi_unit_call_signs_summary', PageUrl: '../units/CallSigns.aspx', SortOrder: 102 },
          { Id: 169, PageName: 'Cabinets', PageCode: 'oi_cabinet_list', PageUrl: '../cabinets/CabinetList.aspx', SortOrder: 105 },
          { Id: 170, PageName: 'Cabinet Types', PageCode: 'oi_cabinet_types', PageUrl: '../cabinets/CabinetTypeList.aspx', SortOrder: 110 },
          { Id: 171, PageName: 'Questionnaires', PageCode: 'oi_questionnaire_list', PageUrl: '../questionnaires/QuestionnaireList.aspx', SortOrder: 115 },
          { Id: 204, PageName: 'RFID<br />Locations', PageCode: 'oi_rfid_location_tag_list', PageUrl: '../units/UnitTagRuleList.aspx', SortOrder: 125 }
        ]
      },
      {
        Id: 172,
        PageName: 'Blood',
        PageCode: 'oi_blood_menu',
        PageUrl: '#',
        SortOrder: 120,
        Children: [
          { Id: 173, PageName: 'Blood<br />Setup', PageCode: 'oi_blood_type_list', PageUrl: '../blood/BloodTypeList.aspx', SortOrder: 125 },
          { Id: 174, PageName: 'Cooler<br />Setup', PageCode: 'oi_blood_cooler_type_list', PageUrl: '../blood/CoolerTypeList.aspx', SortOrder: 130 },
          { Id: 175, PageName: 'Storage Setup', PageCode: 'oi_blood_storage_list', PageUrl: '../blood/StorageList.aspx', SortOrder: 135 },
          { Id: 176, PageName: 'Forms', PageCode: 'oi_blood_forms', PageUrl: '../blood/FormList.aspx', SortOrder: 140 },
          { Id: 177, PageName: 'Actions', PageCode: 'oi_blood_form_event', PageUrl: '../blood/FormEvent.aspx', SortOrder: 145 }
        ]
      },
      {
        Id: 178,
        PageName: 'Narcotics',
        PageCode: 'oi_narcotic_setup_menu',
        PageUrl: '#',
        SortOrder: 150,
        Children: [
          { Id: 179, PageName: 'Narcotic<br />Setup', PageCode: 'oi_narcotic_type_list', PageUrl: '../narcotics/NarcoticTypeList.aspx', SortOrder: 155 },
          { Id: 180, PageName: 'Box<br />Setup', PageCode: 'oi_narcotic_box_type_list', PageUrl: '../narcotics/BoxTypeList.aspx', SortOrder: 160 },
          { Id: 181, PageName: 'Safe<br />Setup', PageCode: 'oi_narcotic_safe_list', PageUrl: '../narcotics/SafeList.aspx', SortOrder: 165 },
          { Id: 182, PageName: 'Forms', PageCode: 'oi_narcotic_form_list', PageUrl: '../narcotics/FormList.aspx', SortOrder: 170 },
          { Id: 183, PageName: 'Actions', PageCode: 'oi_narcotic_form_event', PageUrl: '../narcotics/FormEvent.aspx', SortOrder: 175 }
        ]
      },
      {
        Id: 184,
        PageName: 'Fleet',
        PageCode: 'oi_fleet_menu',
        PageUrl: '#',
        SortOrder: 180,
        Children: [
          { Id: 185, PageName: 'Forms', PageCode: 'oi_fleet_form_list', PageUrl: '../fleet/FormList.aspx', SortOrder: 185 },
          { Id: 186, PageName: 'Service<br />Providers', PageCode: 'oi_fleet_provider_list', PageUrl: '../fleet/ServiceProviderList.aspx', SortOrder: 190 },
          { Id: 187, PageName: 'Labor/<br />Mechanics', PageCode: 'oi_fleet_labor_cost_list', PageUrl: '../fleet/LaborCostList.aspx', SortOrder: 195 },
          { Id: 188, PageName: 'Customers', PageCode: 'oi_fleet_custom_list', PageUrl: '../fleet/CustomersList.aspx', SortOrder: 200 },
          { Id: 191, PageName: 'Fleet Genius', PageCode: 'oi_fleet_genius', PageUrl: '../units/FleetGeniusList.aspx', SortOrder: 215 },
          { Id: 192, PageName: 'Telematics', PageCode: 'oi_telematic', PageUrl: '../fleetTracking/TelematicDeviceList.aspx', SortOrder: 220 }
        ]
      },
      {
        Id: 193,
        PageName: 'Service Desk',
        PageCode: 'oi_desk_menu',
        PageUrl: '#',
        SortOrder: 225,
        Children: [
          { Id: 194, PageName: 'Department<br />Management', PageCode: 'oi_desk_category_list', PageUrl: '../desk/CategoryList.aspx', SortOrder: 230 },
          { Id: 195, PageName: 'Ticket<br /> Statuses', PageCode: 'oi_desk_status_list', PageUrl: '../desk/StatusList.aspx', SortOrder: 235 },
          { Id: 196, PageName: 'Supervisors', PageCode: 'oi_desk_supervisor_list', PageUrl: '../desk/SupervisorList.aspx', SortOrder: 240 }
        ]
      },
      {
        Id: 197,
        PageName: 'Facilities',
        PageCode: 'oi_facility_menu',
        PageUrl: '#',
        SortOrder: 245,
        Children: [
          { Id: 198, PageName: 'Maintenance<br />Types', PageCode: 'oi_facility_maintenance_type_list', PageUrl: '../facilities/MaintenanceTypeList.aspx', SortOrder: 250 },
          { Id: 199, PageName: 'Facilities', PageCode: 'oi_facility_list', PageUrl: '../facilities/FacilityList.aspx', SortOrder: 255 },
          { Id: 200, PageName: 'Forms', PageCode: 'oi_facility_forms', PageUrl: '../facilities/FormList.aspx', SortOrder: 260 },
          { Id: 201, PageName: 'Questionnaires', PageCode: 'oi_facility_questionnaires', PageUrl: '../facilities/QuestionnaireList.aspx', SortOrder: 265 },
          { Id: 202, PageName: 'Contacts', PageCode: 'oi_facility_contact', PageUrl: '../facilities/ContactList.aspx', SortOrder: 270 }
        ]
      },
      {
        Id: 207,
        PageName: 'Crew',
        PageCode: 'oi_crew_menu',
        PageUrl: '#',
        SortOrder: 295,
        Children: [
          { Id: 208, PageName: 'Crew<br />Members', PageCode: 'oi_crew_list', PageUrl: '../crews/CrewList.aspx', SortOrder: 300 },
          { Id: 209, PageName: 'Role<br />Security', PageCode: 'oi_roles', PageUrl: '../crews/RoleList.aspx', SortOrder: 305 },
          { Id: 210, PageName: 'External<br />Crew', PageCode: 'oi_external_crew_list', PageUrl: '../crews/ExternalCrewList.aspx', SortOrder: 310 },
          { Id: 206, PageName: 'RFID<br />Crew Badges', PageCode: 'oi_rfid_crew_list', PageUrl: '../crews/RFIDCrewList.aspx', SortOrder: 320 },
          { Id: 307, PageName: 'SSO<br/>Setup', PageCode: 'oi_sso_integtation_view', PageUrl: '../apps/sso/integrations', SortOrder: 325 }
        ]
      },
      {
        Id: 298,
        PageName: 'Workforce',
        PageCode: 'oi_workforce_menu',
        PageUrl: '#',
        SortOrder: 297,
        Children: [
          { Id: 299, PageName: 'Rotation<br/>Management', PageCode: 'oi_cs_rotation_manage', PageUrl: '../apps/crew-scheduling/rotations', SortOrder: 298 },
          { Id: 300, PageName: 'Schedule<br/>Templates', PageCode: 'oi_cs_schedule_templates_manage', PageUrl: '../apps/crew-scheduling/schedule-templates', SortOrder: 299 },
          { Id: 301, PageName: 'Credentials', PageCode: 'oi_cs_credential_manage', PageUrl: '../apps/crew-scheduling/credentials', SortOrder: 301 },
          { Id: 302, PageName: 'Position<br/>Profiles', PageCode: 'oi_cs_position_profiles_manage', PageUrl: '../apps/crew-scheduling/position-profiles', SortOrder: 302 },
          { Id: 312, PageName: 'Approvers', PageCode: 'oi_cs_credentials_approvers', PageUrl: '../apps/crew-scheduling/credentials-approvers', SortOrder: 303 }
        ]
      },
      {
        Id: 211,
        PageName: 'Events',
        PageCode: 'oi_event_menu',
        PageUrl: '#',
        SortOrder: 315,
        Children: [
          { Id: 212, PageName: 'Event<br />Setup', PageCode: 'oi_event_summary', PageUrl: '../events/EventList.aspx', SortOrder: 320 },
          { Id: 213, PageName: 'Forms', PageCode: 'oi_event_view', PageUrl: '../events/FormList.aspx', SortOrder: 325 }
        ]
      },
      {
        Id: 293,
        PageName: 'Tasks',
        PageCode: 'oi_task_list_menu',
        PageUrl: '#',
        SortOrder: 317,
        Children: [
          { Id: 294, PageName: 'Templates', PageCode: 'oi_task_list_view', PageUrl: '../apps/task-list/template-view', SortOrder: 319 },
          { Id: 297, PageName: 'Task List Setup', PageCode: 'oi_task_list_setup_view', PageUrl: '../apps/task-list/setup-view', SortOrder: 321 }
        ]
      },
      {
        Id: 214,
        PageName: 'System',
        PageCode: 'oi_settings_menu',
        PageUrl: '#',
        SortOrder: 330,
        Children: [
          { Id: 205, PageName: 'RFID<br />Readers', PageCode: 'oi_rfid_readers_list', PageUrl: '../assets/RFIDReadersList.aspx', SortOrder: 330 },
          { Id: 215, PageName: 'Dispatch<br />Board', PageCode: 'oi_dispatch_board_manage', PageUrl: '../units/DispatchBoardList.aspx', SortOrder: 335 },
          { Id: 216, PageName: 'Time Zone<br />Management', PageCode: 'oi_time_zone_list', PageUrl: '../settings/TimeZoneList.aspx', SortOrder: 340 },
          { Id: 217, PageName: 'Divisions', PageCode: 'oi_division_list', PageUrl: '../divisions/DivisionList.aspx', SortOrder: 345 },
          { Id: 218, PageName: 'Quick<br />Statistics', PageCode: 'oi_dashboard_manage', PageUrl: '../Dashboard/DashboardList.aspx', SortOrder: 350 },
          { Id: 219, PageName: 'Status<br />Boards', PageCode: 'oi_statusboard_list', PageUrl: '../customerDashboard/CustomerDashboardList.aspx', SortOrder: 355 },
          { Id: 220, PageName: 'Data<br />Management', PageCode: 'oi_import_export_summary', PageUrl: '../ImportExport/Summary.aspx', SortOrder: 360 },
          { Id: 221, PageName: 'System<br />Settings', PageCode: 'oi_settings', PageUrl: '../settings/Settings.aspx', SortOrder: 365 }
        ]
      }
    ]
  },
  {
    Id: 148,
    PageName: 'Operations Menu',
    PageCode: 'Operations_Menu',
    PageUrl: '#',
    SortOrder: 0,
    Children: [
      {
        Id: 222,
        PageName: 'Purchasing',
        PageCode: 'oi_purchasing_menu',
        PageUrl: '#',
        SortOrder: 1000,
        Children: [
          { Id: 223, PageName: 'Purchase<br /> Orders', PageCode: 'oi_purchasing_po_list', PageUrl: '../purchasing/POList.aspx', SortOrder: 1005 },
          { Id: 224, PageName: 'Parts<br /> & Assets', PageCode: 'oi_part_list', PageUrl: '../parts/PartList.aspx', SortOrder: 1010 },
          { Id: 225, PageName: 'Services', PageCode: 'oi_purchasing_po_service_manage', PageUrl: '../purchasing/POServicesList.aspx', SortOrder: 1015 },
          { Id: 226, PageName: 'Inventory<br /> Analysis', PageCode: 'oi_inventory_analysis', PageUrl: '../inventory/InventoryAnalysis.aspx', SortOrder: 1020 },
          { Id: 227, PageName: 'Inventory<br />Levels', PageCode: 'oi_supply_room_inventory_levels', PageUrl: '../rooms/SupplyRoomInventoryLevels.aspx', SortOrder: 1025 },
          { Id: 228, PageName: 'Supplier Catalogs', PageCode: 'oi_purchase_item_list', PageUrl: '../settings/PurchaseItemList.aspx', SortOrder: 1030 }
        ]
      },
      {
        Id: 229,
        PageName: 'Inventory',
        PageCode: 'oi_inventory_menu',
        PageUrl: '#',
        SortOrder: 1035,
        Children: [
          { Id: 230, PageName: 'Receive<br /> Inventory', PageCode: 'oi_inventory_receive', PageUrl: '../inventory/ReceiveInventory.aspx', SortOrder: 1040 },
          { Id: 231, PageName: 'Transfer<br /> Inventory', PageCode: 'oi_inventory_transfer', PageUrl: '../inventory/TransferInventory.aspx', SortOrder: 1045 },
          { Id: 232, PageName: 'Issue<br /> Inventory', PageCode: 'oi_inventory_issue', PageUrl: '../inventory/IssueInventory.aspx', SortOrder: 1050 },
          { Id: 233, PageName: 'Supply<br /> Request', PageCode: 'oi_s_request_list', PageUrl: '../requests/SupplyRequestList.aspx', SortOrder: 1055 },
          { Id: 234, PageName: 'Cycle<br /> Counting', PageCode: 'oi_inventory_cyclecounting', PageUrl: '../inventory/CycleCounting.aspx', SortOrder: 1060 },
          { Id: 235, PageName: 'Kit<br /> Management', PageCode: 'oi_kit_load', PageUrl: '../kits/LoadKit.aspx', SortOrder: 1065 },
          { Id: 291, PageName: 'Kit<br /> Tracking', PageCode: 'oi_kit_tracking_view', PageUrl: '../kits/KitInventoryTracking.aspx', SortOrder: 1067 },
          { Id: 236, PageName: 'Submit<br /> Requisition', PageCode: 'oi_req_request', PageUrl: '../requests/CreateRequisitionRequest.aspx', SortOrder: 1070 },
          { Id: 279, PageName: 'Inventory<br />RFID', PageCode: 'oi_inventory_rfid_status', PageUrl: '../inventory/InventoryRFID.aspx', SortOrder: 1080 },
          { Id: 277, PageName: 'Kit<br />RFID', PageCode: 'oi_kit_tracking', PageUrl: '../kits/KitTracking.aspx', SortOrder: 1090 }
        ]
      },
      {
        Id: 237,
        PageName: 'Assets',
        PageCode: 'oi_part_menu',
        PageUrl: '#',
        SortOrder: 1075,
        Children: [
          { Id: 238, PageName: 'Asset<br /> Management', PageCode: 'oi_asset_list', PageUrl: '../assets/AssetList.aspx', SortOrder: 1080 },
          { Id: 239, PageName: 'Fixed Asset<br />Tracking', PageCode: 'oi_asset_verification', PageUrl: '../assets/AssetVerificationList.aspx', SortOrder: 1085 },
          { Id: 240, PageName: 'Check Out/In', PageCode: 'oi_asset_checkout', PageUrl: '../assets/CheckOut.aspx', SortOrder: 1090 },
          { Id: 241, PageName: 'Pending Requisitions', PageCode: 'oi_asset_requisition', PageUrl: '../assets/AssetRequisitionList.aspx', SortOrder: 1095 },
          { Id: 242, PageName: 'Maintenance<br /> Due', PageCode: 'oi_asset_maintenance_list', PageUrl: '../assets/AssetMaintenanceList.aspx', SortOrder: 1100 },
          { Id: 243, PageName: 'Maintenance<br />History', PageCode: 'oi_asset_maintenance_history', PageUrl: '../assets/AssetMaintenanceHistoryList.aspx', SortOrder: 1105 },
          { Id: 276, PageName: 'Asset<br />RFID', PageCode: 'oi_asset_tracking', PageUrl: '../assets/AssetTracking.aspx', SortOrder: 1115 }
        ]
      },
      {
        Id: 244,
        PageName: 'Units',
        PageCode: 'oi_unit_menu',
        PageUrl: '#',
        SortOrder: 1110,
        Children: [
          { Id: 245, PageName: 'Units', PageCode: 'oi_unit_list_op', PageUrl: '../units/UnitListOp.aspx', SortOrder: 1115 }
        ]
      },
      {
        Id: 246,
        PageName: 'Blood',
        PageCode: 'oi_blood_menu',
        PageUrl: '#',
        SortOrder: 1120,
        Children: [
          { Id: 247, PageName: 'Blood<br />Storage', PageCode: 'oi_blood_storage', PageUrl: '../blood/BloodStorage.aspx', SortOrder: 1125 },
          { Id: 248, PageName: 'Coolers', PageCode: 'oi_blood_cooler_list', PageUrl: '../blood/BloodCoolers.aspx', SortOrder: 1130 },
          { Id: 249, PageName: 'Control # Search', PageCode: 'oi_blood_search', PageUrl: '../blood/BloodSearch.aspx', SortOrder: 1135 },
          { Id: 309, PageName: 'Administered List', PageCode: 'oi_blood_administered_list', PageUrl: '/blood/BloodAdministeredList.aspx', SortOrder: 1136 },
          { Id: 311, PageName: 'Incident Reports', PageCode: 'oi_blood_incident_report_list', PageUrl: '/blood/BloodIncidentReportList.aspx', SortOrder: 1137 }
        ]
      },
      {
        Id: 250,
        PageName: 'Narcotics',
        PageCode: 'oi_narcotic_setup_menu',
        PageUrl: '#',
        SortOrder: 1140,
        Children: [
          { Id: 251, PageName: 'Narcotic<br />Safe', PageCode: 'oi_narcotic_safe', PageUrl: '../narcotics/NarcoticSafe.aspx', SortOrder: 1145 },
          { Id: 252, PageName: 'My Control<br />Numbers', PageCode: 'oi_my_control_numbers', PageUrl: '../narcotics/MyControlNumbers.aspx', SortOrder: 1150 },
          { Id: 253, PageName: 'Control # Search', PageCode: 'oi_narcotic_search', PageUrl: '../narcotics/NarcoticSearch.aspx', SortOrder: 1155 },
          { Id: 254, PageName: 'Administered<br />List', PageCode: 'oi_administered_list', PageUrl: '../narcotics/AdministeredList.aspx', SortOrder: 1160 },
          { Id: 255, PageName: 'Incident<br />Reports', PageCode: 'oi_incident_report', PageUrl: '../narcotics/IncidentReportList.aspx', SortOrder: 1165 },
          { Id: 256, PageName: 'Narcotic<br />Analysis', PageCode: 'oi_narcotic_analytics', PageUrl: '../narcotics/NarcoticAnalysis.aspx', SortOrder: 1170 },
          { Id: 278, PageName: 'Narcotics<br />RFID', PageCode: 'oi_narcotic_box_tracking', PageUrl: '../narcotics/NarcoticBoxTracking.aspx?type=control', SortOrder: 1180 }
        ]
      },
      {
        Id: 257,
        PageName: 'Fleet',
        PageCode: 'oi_fleet_menu',
        PageUrl: '#',
        SortOrder: 1175,
        Children: [
          { Id: 258, PageName: 'Maintenance<br />Schedules', PageCode: 'oi_fleet_maint_sched_list', PageUrl: '../fleet/MaintenanceScheduleList.aspx', SortOrder: 1180 },
          { Id: 259, PageName: 'Maintenance<br />Due', PageCode: 'oi_fleet_maint_due', PageUrl: '../fleet/MaintenanceDue.aspx', SortOrder: 1185 },
          { Id: 260, PageName: 'Maintenance<br />History', PageCode: 'oi_fleet_maint_log', PageUrl: '../fleet/MaintenanceLogList.aspx', SortOrder: 1190 },
          { Id: 261, PageName: 'Core Bank', PageCode: 'oi_fleet_core_bank', PageUrl: '../coreBank/CoreBankList.aspx', SortOrder: 1195 },
          { Id: 262, PageName: 'Service<br />Parts', PageCode: 'oi_fleet_service_part_list', PageUrl: '../fleet/ServicePartList.aspx', SortOrder: 1200 },
          { Id: 265, PageName: 'Telematics', PageCode: 'oi_telematic_info', PageUrl: '../fleetTracking/TelematicDeviceInfoList.aspx', SortOrder: 1215 },
          { Id: 266, PageName: 'File<br /> Management', PageCode: 'oi_fleet_file_mangement', PageUrl: '../fleet/FileManagementList.aspx', SortOrder: 1220 }
        ]
      },
      {
        Id: 267,
        PageName: 'Service Desk',
        PageCode: 'oi_desk_menu',
        PageUrl: '#',
        SortOrder: 1225,
        Children: [
          { Id: 268, PageName: 'Ticket<br />Management', PageCode: 'oi_desk_ticket_list', PageUrl: '../desk/TicketList.aspx', SortOrder: 1230 },
          { Id: 269, PageName: 'My<br />Tickets', PageCode: 'oi_desk_my_ticket_list', PageUrl: '../desk/MyTicketList.aspx', SortOrder: 1235 }
        ]
      },
      {
        Id: 270,
        PageName: 'Facilities',
        PageCode: 'oi_facility_menu',
        PageUrl: '#',
        SortOrder: 1240,
        Children: [
          { Id: 271, PageName: 'Facilities', PageCode: 'oi_facility_list_op', PageUrl: '../facilities/FacilityListOp.aspx', SortOrder: 1245 },
          { Id: 272, PageName: 'Maintenance<br />Due', PageCode: 'oi_facility_maintenance_list', PageUrl: '../facilities/MaintenanceList.aspx', SortOrder: 1250 },
          { Id: 273, PageName: 'Maintenance<br />History', PageCode: 'oi_facility_maintenance_history', PageUrl: '../facilities/MaintenanceHistoryList.aspx', SortOrder: 1255 },
          { Id: 274, PageName: 'File<br />Management', PageCode: 'oi_facility_file_management', PageUrl: '../facilities/FileManagementList.aspx', SortOrder: 1260 }
        ]
      },
      {
        Id: 305,
        PageName: 'Workforce',
        PageCode: 'oi_workforce_menu',
        PageUrl: '#',
        SortOrder: 1266,
        Children: [
          { Id: 306, PageName: 'Schedule<br/>Management', PageCode: 'oi_cs_schedule_manage', PageUrl: '../apps/crew-scheduling/schedule-calendar', SortOrder: 1267 },
          { Id: 310, PageName: 'Compliance<br/>Monitoring', PageCode: 'oi_cs_compliance_monitoring', PageUrl: '../apps/crew-scheduling/compliance-monitoring', SortOrder: 1275 }
        ]
      },
      {
        Id: 280,
        PageName: 'Events',
        PageCode: 'oi_event_menu',
        PageUrl: '#',
        SortOrder: 1290,
        Children: [
          { Id: 281, PageName: 'Events', PageCode: 'oi_event_op_summary', PageUrl: '../events/EventOpList.aspx', SortOrder: 1295 }
        ]
      },
      {
        Id: 295,
        PageName: 'Tasks',
        PageCode: 'oi_task_list_menu',
        PageUrl: '#',
        SortOrder: 1292,
        Children: [
          { Id: 303, PageName: 'Task Management', PageCode: 'oi_task_list_management_view', PageUrl: '../apps/task-list/task-list-summary', SortOrder: 1296 },
          { Id: 304, PageName: 'My Tasks', PageCode: 'oi_my_task_list_view', PageUrl: '../apps/task-list/my-task-list', SortOrder: 1298 }
        ]
      },
      {
        Id: 282,
        PageName: 'Reports',
        PageCode: 'oi_report_menu',
        PageUrl: '#',
        SortOrder: 1300,
        Children: [
          { Id: 283, PageName: 'Dispatch<br />Board', PageCode: 'oi_dispatch_board_view', PageUrl: '../units/DispatchBoard.aspx', SortOrder: 1305 },
          { Id: 284, PageName: 'Facility<br />Inspections', PageCode: 'oi_facility_inspection_list', PageUrl: '../facilities/FacilityInspectionList.aspx', SortOrder: 1310 },
          { Id: 286, PageName: 'Unit<br />Inspections', PageCode: 'oi_unit_inspection_history', PageUrl: '../units/UnitInspectionHistory.aspx', SortOrder: 1320 },
          { Id: 288, PageName: 'Transaction<br />History', PageCode: 'oi_trn_history', PageUrl: '../inventory/TransactionHistory.aspx', SortOrder: 1330 },
          { Id: 289, PageName: 'Reports', PageCode: 'oi_report_list', PageUrl: '../security/Login.aspx?action=reportRedirect', SortOrder: 1335 }
        ]
      }
    ]
  }
];
