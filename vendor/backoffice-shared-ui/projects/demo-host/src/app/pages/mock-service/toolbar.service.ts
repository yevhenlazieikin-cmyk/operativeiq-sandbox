import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToolbarService {
  private readonly mockToolbarData = {
    administration: [
      {
        name: 'Purchasing',
        url: '',
        items: [
          {
            name: 'Suppliers',
            url: 'https://dev.operativeiq.com/purchasing/supplierlist.aspx'
          },
          {
            name: 'GL',
            url: 'https://dev.operativeiq.com/purchasing/GeneralLedgerList.aspx'
          },
          {
            name: 'Drop Ship Locations',
            url: 'https://dev.operativeiq.com/purchasing/DropShipList.aspx'
          },
          {
            name: 'Currencies',
            url: 'https://dev.operativeiq.com/settings/currency.aspx'
          }
        ]
      },
      {
        name: 'Inventory',
        url: '',
        items: [
          {
            name: 'Supply Rooms',
            url: 'https://dev.operativeiq.com/rooms/SupplyRoomList.aspx'
          },
          {
            name: 'Requisition Forms',
            url: 'https://dev.operativeiq.com/requests/FormList.aspx'
          },
          {
            name: 'Kit Management',
            url: 'https://dev.operativeiq.com/kits/KitList.aspx'
          }
        ]
      },
      {
        name: 'Assets',
        url: '',
        items: [
          {
            name: 'Asset Classes',
            url: 'https://dev.operativeiq.com/assets/AssetClassList.aspx'
          },
          {
            name: 'Maintenance Type',
            url: 'https://dev.operativeiq.com/assets/MaintenanceTypeList.aspx'
          },
          {
            name: 'Forms',
            url: 'https://dev.operativeiq.com/assets/FormList.aspx'
          },
          {
            name: 'Service Providers',
            url: 'https://dev.operativeiq.com/assets/ServiceProviderList.aspx'
          }
        ]
      },
      {
        name: 'Units',
        url: '',
        items: [
          {
            name: 'Fleet Vehicle Types',
            url: 'https://dev.operativeiq.com/units/UnitFleetTypeList.aspx'
          },
          {
            name: 'Units',
            url: 'https://dev.operativeiq.com/units/UnitList.aspx'
          },
          {
            name: 'Unit Types',
            url: 'https://dev.operativeiq.com/units/UnitTypeList.aspx'
          },
          {
            name: 'Unit Locations',
            url: 'https://dev.operativeiq.com/units/UnitLocationList.aspx'
          },
          {
            name: 'Call Sign',
            url: 'https://dev.operativeiq.com/units/CallSigns.aspx'
          },
          {
            name: 'Cabinets',
            url: 'https://dev.operativeiq.com/cabinets/CabinetList.aspx'
          },
          {
            name: 'Cabinet Types',
            url: 'https://dev.operativeiq.com/cabinets/CabinetTypeList.aspx'
          },
          {
            name: 'Questionnaires',
            url: 'https://dev.operativeiq.com/questionnaires/QuestionnaireList.aspx'
          }
        ]
      },
      {
        name: 'Blood',
        url: '',
        items: [
          {
            name: 'Blood Setup',
            url: 'https://dev.operativeiq.com/blood/BloodTypeList.aspx'
          },
          {
            name: 'Cooler Setup',
            url: 'https://dev.operativeiq.com/blood/CoolerTypeList.aspx'
          },
          {
            name: 'Storage Setup',
            url: 'https://dev.operativeiq.com/blood/StorageList.aspx'
          },
          {
            name: 'Forms',
            url: 'https://dev.operativeiq.com/blood/FormList.aspx'
          },
          {
            name: 'Actions',
            url: 'https://dev.operativeiq.com/blood/FormEvent.aspx'
          }
        ]
      },
      {
        name: 'Narcotics',
        url: '',
        items: [
          {
            name: 'Narcotics Setup',
            url: 'https://dev.operativeiq.com/narcotics/NarcoticTypeList.aspx'
          },
          {
            name: 'Box Setup',
            url: 'https://dev.operativeiq.com/narcotics/BoxTypeList.aspx'
          },
          {
            name: 'Safe Setup',
            url: 'https://dev.operativeiq.com/narcotics/SafeList.aspx'
          },
          {
            name: 'Forms',
            url: 'https://dev.operativeiq.com/narcotics/FormList.aspx'
          },
          {
            name: 'Actions',
            url: 'https://dev.operativeiq.com/narcotics/FormEvent.aspx'
          }
        ]
      },
      {
        name: 'Fleet',
        url: '',
        items: [
          {
            name: 'Forms',
            url: 'https://dev.operativeiq.com/fleet/FormList.aspx'
          },
          {
            name: 'Service Providers',
            url: 'https://dev.operativeiq.com/fleet/ServiceProviderList.aspx'
          },
          {
            name: 'Labor / Management',
            url: 'https://dev.operativeiq.com/fleet/LaborCostList.aspx'
          },
          {
            name: 'Customers',
            url: 'https://dev.operativeiq.com/fleet/CustomersList.aspx'
          },
          {
            name: 'Fleet Genius',
            url: 'https://dev.operativeiq.com/units/FleetGeniusList.aspx'
          },
          {
            name: 'Telematics',
            url: 'https://dev.operativeiq.com/fleetTracking/TelematicDeviceList.aspx'
          }
        ]
      },
      {
        name: 'Service Desk',
        url: '',
        items: [
          {
            name: 'Department Management',
            url: 'https://dev.operativeiq.com/desk/CategoryList.aspx'
          },
          {
            name: 'Ticket Status',
            url: 'https://dev.operativeiq.com/desk/StatusList.aspx'
          },
          {
            name: 'Supervisors',
            url: 'https://dev.operativeiq.com/desk/SupervisorList.aspx'
          }
        ]
      },
      {
        name: 'Facilities',
        url: '',
        items: [
          {
            name: 'Maintenance Types',
            url: 'https://dev.operativeiq.com/facilities/MaintenanceTypeList.aspx'
          },
          {
            name: 'Facilities',
            url: 'https://dev.operativeiq.com/facilities/FacilityList.aspx'
          },
          {
            name: 'Forms',
            url: 'https://dev.operativeiq.com/facilities/FormList.aspx'
          },
          {
            name: 'Questionnaires',
            url: 'https://dev.operativeiq.com/facilities/QuestionnaireList.aspx'
          },
          {
            name: 'Contacts',
            url: 'https://dev.operativeiq.com/facilities/ContactList.aspx'
          }
        ]
      },
      {
        name: 'RFID',
        url: '',
        items: [
          {
            name: 'Location Rules',
            url: 'https://dev.operativeiq.com/units/UnitTagRuleList.aspx'
          },
          {
            name: 'RFID Readers',
            url: 'https://dev.operativeiq.com/assets/RFIDReadersList.aspx'
          },
          {
            name: 'RFID Crew Badges',
            url: 'https://dev.operativeiq.com/crews/RFIDCrewList.aspx'
          }
        ]
      },
      {
        name: 'Crew',
        url: '',
        items: [
          {
            name: 'Crew Members',
            url: 'https://dev.operativeiq.com/crews/CrewList.aspx'
          },
          {
            name: 'Role Security',
            url: 'https://dev.operativeiq.com/crews/RoleList.aspx'
          },
          {
            name: 'External Crew',
            url: 'https://dev.operativeiq.com/crews/ExternalCrewList.aspx'
          }
        ]
      },
      {
        name: 'Scheduling',
        url: '',
        items: [
          {
            name: 'Rotation Management',
            url: ''
          }
        ]
      },
      {
        name: 'Events',
        url: '',
        items: [
          {
            name: 'Event Setup',
            url: 'https://dev.operativeiq.com/events/EventList.aspx'
          },
          {
            name: 'Forms',
            url: 'https://dev.operativeiq.com/events/FormList.aspx'
          }
        ]
      },
      {
        name: 'System',
        url: '',
        items: [
          {
            name: 'Dispatch Boards',
            url: 'https://dev.operativeiq.com/units/DispatchBoardList.aspx'
          },
          {
            name: 'Time Zone Management',
            url: 'https://dev.operativeiq.com/settings/TimeZoneList.aspx'
          },
          {
            name: 'Divisions',
            url: 'https://dev.operativeiq.com/divisions/DivisionList.aspx'
          },
          {
            name: 'Quick Statistics',
            url: 'https://dev.operativeiq.com/Dashboard/DashboardList.aspx'
          },
          {
            name: 'Status Boards',
            url: 'https://dev.operativeiq.com/customerDashboard/CustomerDashboardList.aspx'
          },
          {
            name: 'Data Management',
            url: 'https://dev.operativeiq.com/ImportExport/Summary.aspx'
          },
          {
            name: 'System Settings',
            url: 'https://dev.operativeiq.com/settings/Settings.aspx'
          }
        ]
      }
    ],
    operation: [
      {
        name: 'Purchasing',
        url: '',
        items: [
          {
            name: 'Purchase Orders',
            url: 'https://dev.operativeiq.com/purchasing/POList.aspx'
          },
          {
            name: 'Parts & Assets',
            url: 'https://dev.operativeiq.com/parts/PartList.aspx'
          },
          {
            name: 'Services',
            url: 'https://dev.operativeiq.com/purchasing/POServicesList.aspx'
          },
          {
            name: 'Inventory Analysis',
            url: 'https://dev.operativeiq.com/inventory/InventoryAnalysis.aspx'
          },
          {
            name: 'Inventory Levels',
            url: 'https://dev.operativeiq.com/rooms/SupplyRoomInventoryLevels.aspx'
          },
          {
            name: 'Supplier Catalogs',
            url: 'https://dev.operativeiq.com/settings/PurchaseItemList.aspx'
          }
        ]
      },
      {
        name: 'Inventory',
        url: '',
        items: [
          {
            name: 'Receive Inventory',
            url: 'https://dev.operativeiq.com/inventory/ReceiveInventory.aspx'
          },
          {
            name: 'Transfer Inventory',
            url: 'https://dev.operativeiq.com/inventory/TransferInventory.aspx'
          },
          {
            name: 'Issue Inventory',
            url: 'https://dev.operativeiq.com/inventory/IssueInventory.aspx'
          },
          {
            name: 'Supply Request',
            url: 'https://dev.operativeiq.com/requests/SupplyRequestList.aspx'
          },
          {
            name: 'Cycle Counting',
            url: 'https://dev.operativeiq.com/inventory/CycleCounting.aspx'
          },
          {
            name: 'Manage Kits',
            url: 'https://dev.operativeiq.com/kits/LoadKit.aspx'
          },
          {
            name: 'Submit Requisition',
            url: 'https://dev.operativeiq.com/requests/CreateRequisitionRequest.aspx'
          }
        ]
      },
      {
        name: 'Assets',
        url: '',
        items: [
          {
            name: 'Asset Management',
            url: 'https://dev.operativeiq.com/assets/AssetList.aspx'
          },
          {
            name: 'Fixed Asset Tracking',
            url: 'https://dev.operativeiq.com/assets/AssetVerificationList.aspx'
          },
          {
            name: 'Check Out/In',
            url: 'https://dev.operativeiq.com/assets/CheckOut.aspx'
          },
          {
            name: 'Pending Requisitions',
            url: 'https://dev.operativeiq.com/assets/AssetRequisitionList.aspx'
          },
          {
            name: 'Maintenance Due',
            url: 'https://dev.operativeiq.com/assets/AssetMaintenanceList.aspx'
          },
          {
            name: 'Maintenance History',
            url: 'https://dev.operativeiq.com/assets/AssetMaintenanceHistoryList.aspx'
          }
        ]
      },
      {
        name: 'Units',
        url: '',
        items: [
          {
            name: 'Units',
            url: 'https://dev.operativeiq.com/units/UnitListOp.aspx'
          }
        ]
      },
      {
        name: 'Blood',
        url: '',
        items: [
          {
            name: 'Blood Storage',
            url: 'https://dev.operativeiq.com/blood/BloodStorage.aspx'
          },
          {
            name: 'Coolers',
            url: 'https://dev.operativeiq.com/blood/BloodCoolers.aspx'
          },
          {
            name: 'Control # Search',
            url: 'https://dev.operativeiq.com/blood/BloodSearch.aspx'
          }
        ]
      },
      {
        name: 'Narcotics',
        url: '',
        items: [
          {
            name: 'Narcotics Safe',
            url: 'https://dev.operativeiq.com/narcotics/NarcoticSafe.aspx'
          },
          {
            name: 'My Control Numbers',
            url: 'https://dev.operativeiq.com/narcotics/MyControlNumbers.aspx'
          },
          {
            name: 'Control # Search',
            url: 'https://dev.operativeiq.com/narcotics/NarcoticSearch.aspx'
          },
          {
            name: 'Administered List',
            url: 'https://dev.operativeiq.com/narcotics/AdministeredList.aspx'
          },
          {
            name: 'Incident Reports',
            url: 'https://dev.operativeiq.com/narcotics/IncidentReportList.aspx'
          },
          {
            name: 'Narcotic Analysis',
            url: 'https://dev.operativeiq.com/narcotics/NarcoticAnalysis.aspx'
          }
        ]
      },
      {
        name: 'Fleet',
        url: '',
        items: [
          {
            name: 'Maintenance Schedules',
            url: 'https://dev.operativeiq.com/fleet/MaintenanceScheduleList.aspx'
          },
          {
            name: 'Maintenance Due',
            url: 'https://dev.operativeiq.com/fleet/MaintenanceDue.aspx'
          },
          {
            name: 'Maintenance History',
            url: 'https://dev.operativeiq.com/fleet/MaintenanceLogList.aspx'
          },
          {
            name: 'Core Bank',
            url: 'https://dev.operativeiq.com/coreBank/CoreBankList.aspx'
          },
          {
            name: 'Service Parts',
            url: 'https://dev.operativeiq.com/fleet/ServicePartList.aspx'
          },
          {
            name: 'Telematics',
            url: 'https://dev.operativeiq.com/fleetTracking/TelematicDeviceInfoList.aspx'
          },
          {
            name: 'File Management',
            url: 'https://dev.operativeiq.com/fleet/FileManagementList.aspx'
          }
        ]
      },
      {
        name: 'Service Desk',
        url: '',
        items: [
          {
            name: 'Ticket Management',
            url: 'https://dev.operativeiq.com/desk/TicketList.aspx'
          },
          {
            name: 'My Tickets',
            url: 'https://dev.operativeiq.com/desk/MyTicketList.aspx'
          }
        ]
      },
      {
        name: 'Facilities',
        url: '',
        items: [
          {
            name: 'Facilities',
            url: 'https://dev.operativeiq.com/facilities/FacilityListOp.aspx'
          },
          {
            name: 'Maintenance Due',
            url: 'https://dev.operativeiq.com/facilities/MaintenanceList.aspx'
          },
          {
            name: 'Maintenance History',
            url: 'https://dev.operativeiq.com/facilities/MaintenanceHistoryList.aspx'
          },
          {
            name: 'File Management',
            url: 'https://dev.operativeiq.com/facilities/FileManagementList.aspx'
          }
        ]
      },
      {
        name: 'RFID',
        url: '',
        items: [
          {
            name: 'Asset RFID',
            url: 'https://dev.operativeiq.com/assets/AssetTracking.aspx'
          },
          {
            name: 'Kit RFID',
            url: 'https://dev.operativeiq.com/kits/KitTracking.aspx'
          },
          {
            name: 'Narcotics RFID',
            url: 'https://dev.operativeiq.com/narcotics/NarcoticBoxTracking.aspx?type=control'
          },
          {
            name: 'Inventory RFID',
            url: 'https://dev.operativeiq.com/inventory/InventoryRFID.aspx'
          }
        ]
      },
      {
        name: 'Events',
        url: '',
        items: [
          {
            name: 'Events',
            url: 'https://dev.operativeiq.com/events/EventOpList.aspx'
          }
        ]
      },
      {
        name: 'Reports',
        url: '',
        items: [
          {
            name: 'Dispatch Board',
            url: 'https://dev.operativeiq.com/units/DispatchBoard.aspx'
          },
          {
            name: 'Facility Inspections',
            url: 'https://dev.operativeiq.com/facilities/facilityinspectionlist.aspx'
          },
          {
            name: 'Unit Inspections',
            url: 'https://dev.operativeiq.com/units/UnitInspectionHistory.aspx'
          },
          {
            name: 'Transaction History',
            url: 'https://dev.operativeiq.com/inventory/TransactionHistory.aspx'
          },
          {
            name: 'Reports',
            url: 'https://dev.operativeiq.com/Customers/dev/Reports/ReportList.aspx'
          }
        ]
      }
    ]
  };

  getToolbarData(): Observable<any> {
    return of(this.mockToolbarData);
  }
}
