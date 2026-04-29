import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UnitInfo {
  unit: string;
  vehicleType: string;
  yearMakeModel: string;
  vin: string;
  licensePlate: string;
}

export interface OdometerAndHours {
  miles: string;
  hours: string;
}

export interface VehicleTelematics {
  fuel: string;
  battery: string;
  def: string;
  efficiency7Days: string;
  efficiency30Days: string;
  motiveLastCommunication: string;
}

export interface UnitAttachment {
  id: string;
  group: string;
  fileName: string;
}

export interface PartHistoryRow {
  id: string;
  dateInstalled: string;
  woNumber: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  quantity: number;
  cost: number;
  warrantyExpiration: string;
  installedBy: string;
}

export interface FuelTransactionRow {
  id: string;
  date: string;
  odometer: string;
  gallons: number;
  unitCost: number;
  totalCost: number;
  location: string;
  driver: string;
}

export type MaintenanceStatusColor = 'gray' | 'green' | 'red';

export interface MaintenanceHistoryRow {
  id: string;
  date: string;
  unit: string;
  woNumber: string;
  customer: string;
  woStatus: string;
  services: number;
  workOrderType: string;
  reason: string;
  description: string;
  serviceCompletion: string;
  hours: string;
  miles: string;
  labor: string;
  parts: string;
  fees: string;
  total: string;
  statusColor: MaintenanceStatusColor;
}

// ─── Work Order tab types ────────────────────────────────────────────────────

export interface WorkOrderFormData {
  unit: string;
  workOrderNumber: string;
  date: string;
  customer: string;
}

export interface InspectionNotesData {
  miles: string;
  fuelCost: string;
  inspectionStatus: string;
}

export interface WorkOrderStatusData {
  workOrderStatus: string;
  unitServiceStatus: string;
  serviceStatusUpdated: string;
}

export interface MaintenanceInfoData {
  maintenanceSchedule: string;
  maintenanceForm: string;
}

export interface NextMaintenanceData {
  date: string;
  miles: string;
  hours: string;
}

export interface TimeClockData {
  elapsedTime: string;
  estimatedCompletionTime: string;
  timeClockStatus: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseOrderNumber: string;
  supplier: string;
  supplyRoom: string;
  total: number;
  baswarePO: string;
  status: string;
}

export interface WoAlert {
  id: string;
  dateReported: string;
  alertType: string;
  priority: string;
  description: string;
  ticketFaultCode: string;
}

export interface WoPart {
  id: string;
  vmrsCode: string;
  description: string;
  partNumber: string;
  warrantyExpiration: string;
  manufacturer: string;
  failureCode: string;
  quantity: number;
  cost: number;
  retail: number;
  isStock: boolean;
  poNumber: string;
}

export interface WoLabor {
  id: string;
  laborCode: string;
  description: string;
  complaint: string;
  correction: string;
  laborDate: string;
  workAccomplished: string;
  mechanic: string;
  hours: number;
  cost: number;
}

export interface WoServiceItem {
  id: string;
  reasonForRepair: string;
  reasonDescription: string;
  complaint: string;
  alerts: WoAlert[];
  parts: WoPart[];
  labor: WoLabor[];
  notes: string;
}

export interface WoFileAttachment {
  id: string;
  fileName: string;
}

// TODO: replace stubs with real HTTP calls when /fleet/WorkOrder endpoints are wired up
@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  getUnitInfo(): Observable<UnitInfo> {
    return of({
      unit: 'Lazierkin unit',
      vehicleType: 'Ford Type II',
      yearMakeModel: '',
      vin: '1GBZGUCL7C1166826',
      licensePlate: '',
    });
  }

  getOdometerAndHours(): Observable<OdometerAndHours> {
    return of({ miles: '124,576', hours: '12,170' });
  }

  getVehicleTelematics(): Observable<VehicleTelematics> {
    return of({
      fuel: 'N/A',
      battery: 'N/A',
      def: 'N/A',
      efficiency7Days: '10.8 mpg (497.2 Miles)',
      efficiency30Days: '11.2 mpg (3,571.4 Miles)',
      motiveLastCommunication: '27/03/2026 07:09:47 AM',
    });
  }

  getUnitAttachments(): Observable<UnitAttachment[]> {
    return of([
      { id: 'UA001', group: '1802', fileName: '3-mb-sample-pdf-file.pdf' },
      { id: 'UA002', group: '1802', fileName: '1.pdf' },
      { id: 'UA003', group: 'A', fileName: 'Admin Room test long name.xlsx' },
      { id: 'UA004', group: 'A', fileName: '1mb.docx' },
      { id: 'UA005', group: 'REPORTS', fileName: 'GMR Reporting Draft.xlsx' },
    ]);
  }

  getMaintenanceHistory(): Observable<MaintenanceHistoryRow[]> {
    return of([
      { id: 'MH1', date: '11/19/2024', unit: '2001', woNumber: '8001234', customer: 'FLEET A - Truck', woStatus: 'Closed', services: 3, workOrderType: 'Work Order', reason: 'Preventive Maintenance', description: 'Scheduled maintenance inspection', serviceCompletion: 'In Service',              hours: '999', miles: '124,576', labor: '0.00',   parts: '0.00',   fees: '0.00',  total: '0.00',     statusColor: 'gray'  },
      { id: 'MH2', date: '11/05/2024', unit: '2001', woNumber: '8001185', customer: 'FLEET A - Truck', woStatus: 'Closed', services: 2, workOrderType: 'Work Order', reason: 'Breakdown',              description: 'Engine overheating issue',         serviceCompletion: 'Unscheduled Maintenance', hours: '985', miles: '123,450', labor: '350.00', parts: '425.50', fees: '25.00', total: '800.50',   statusColor: 'gray'  },
      { id: 'MH3', date: '10/22/2024', unit: '2001', woNumber: '8001102', customer: 'FLEET A - Truck', woStatus: 'Closed', services: 4, workOrderType: 'Work Order', reason: 'Preventive Maintenance', description: 'Oil change and tire rotation',     serviceCompletion: 'In Service',              hours: '972', miles: '122,100', labor: '125.00', parts: '85.75',  fees: '15.00', total: '225.75',   statusColor: 'green' },
      { id: 'MH4', date: '10/15/2024', unit: '2001', woNumber: '8001089', customer: 'FLEET A - Truck', woStatus: 'Open',   services: 1, workOrderType: 'Work Order', reason: 'Road Call',              description: 'Brake system failure',             serviceCompletion: 'Unscheduled Maintenance', hours: '965', miles: '121,340', labor: '450.00', parts: '675.00', fees: '50.00', total: '1,175.00', statusColor: 'red'   },
      { id: 'MH5', date: '09/30/2024', unit: '2001', woNumber: '8001022', customer: 'FLEET A - Truck', woStatus: 'Closed', services: 3, workOrderType: 'Work Order', reason: 'Inspection, Routine',    description: 'Annual safety inspection',         serviceCompletion: 'In Service',              hours: '950', miles: '119,800', labor: '200.00', parts: '150.00', fees: '35.00', total: '385.00',   statusColor: 'green' },
      { id: 'MH6', date: '09/18/2024', unit: '2001', woNumber: '8000988', customer: 'FLEET A - Truck', woStatus: 'Closed', services: 2, workOrderType: 'Work Order', reason: "Driver's Report",        description: 'AC not working properly',          serviceCompletion: 'Unscheduled Maintenance', hours: '942', miles: '118,920', labor: '275.00', parts: '320.00', fees: '20.00', total: '615.00',   statusColor: 'gray'  },
    ]);
  }

  getPartHistory(): Observable<PartHistoryRow[]> {
    return of([
      { id: 'PH1', dateInstalled: '11/19/2024', woNumber: '8001234', partNumber: 'FL-2016',     description: 'Oil Filter - Heavy Duty', manufacturer: 'Fleetguard', quantity: 1, cost: 45.99,  warrantyExpiration: '05/19/2025', installedBy: 'Gavur Halyna'   },
      { id: 'PH2', dateInstalled: '11/05/2024', woNumber: '8001185', partNumber: 'AF-25962',    description: 'Air Filter Element',      manufacturer: 'Fleetguard', quantity: 1, cost: 89.50,  warrantyExpiration: '11/05/2025', installedBy: 'John Smith'     },
      { id: 'PH3', dateInstalled: '10/22/2024', woNumber: '8001102', partNumber: 'BW-5073',     description: 'Coolant Filter',          manufacturer: 'Baldwin',    quantity: 2, cost: 52.25,  warrantyExpiration: '10/22/2025', installedBy: 'Mike Johnson'   },
      { id: 'PH4', dateInstalled: '10/15/2024', woNumber: '8001089', partNumber: 'DT-466E-BRK', description: 'Brake Pad Set - Front',   manufacturer: 'Detroit',    quantity: 1, cost: 225.00, warrantyExpiration: '10/15/2025', installedBy: 'Sarah Williams' },
      { id: 'PH5', dateInstalled: '09/30/2024', woNumber: '8001022', partNumber: 'GATES-T287',  description: 'Serpentine Belt',         manufacturer: 'Gates',      quantity: 1, cost: 67.50,  warrantyExpiration: '03/30/2025', installedBy: 'David Brown'    },
    ]);
  }

  getFuelTransactions(): Observable<FuelTransactionRow[]> {
    return of([
      { id: 'FT1', date: '04/15/2026', odometer: '124,210', gallons: 35.4,  unitCost: 3.89, totalCost: 137.71, location: 'Main Depot - Pump 2',      driver: 'John Smith'     },
      { id: 'FT2', date: '04/01/2026', odometer: '123,540', gallons: 42.1,  unitCost: 3.92, totalCost: 165.03, location: 'Fleet Fuel Station A',      driver: 'Gavur Halyna'   },
      { id: 'FT3', date: '03/18/2026', odometer: '122,870', gallons: 38.7,  unitCost: 3.85, totalCost: 149.00, location: 'Main Depot - Pump 1',      driver: 'John Smith'     },
      { id: 'FT4', date: '03/04/2026', odometer: '122,190', gallons: 40.0,  unitCost: 3.78, totalCost: 151.20, location: 'Roadside - Shell Station',  driver: 'Mike Johnson'   },
      { id: 'FT5', date: '02/18/2026', odometer: '121,490', gallons: 33.9,  unitCost: 3.80, totalCost: 128.82, location: 'Fleet Fuel Station B',      driver: 'Sarah Williams' },
      { id: 'FT6', date: '02/03/2026', odometer: '120,840', gallons: 44.2,  unitCost: 3.75, totalCost: 165.75, location: 'Main Depot - Pump 2',      driver: 'Gavur Halyna'   },
      { id: 'FT7', date: '01/20/2026', odometer: '120,110', gallons: 37.6,  unitCost: 3.69, totalCost: 138.74, location: 'Fleet Fuel Station A',      driver: 'David Brown'    },
    ]);
  }

  // ─── Work Order tab mock data ────────────────────────────────────────────────

  getWorkOrderFormData(): Observable<WorkOrderFormData> {
    return of({ unit: 'Lazierkin unit', workOrderNumber: '87798560', date: '20/05/2024', customer: 'FLEET A - Truck' });
  }

  getInspectionNotesData(): Observable<InspectionNotesData> {
    return of({ miles: '', fuelCost: '0.00', inspectionStatus: 'Incomplete' });
  }

  getWorkOrderStatusData(): Observable<WorkOrderStatusData> {
    return of({ workOrderStatus: 'Open', unitServiceStatus: 'In Service', serviceStatusUpdated: '04/22/2026 10:30 AM' });
  }

  getMaintenanceInfoData(): Observable<MaintenanceInfoData> {
    return of({ maintenanceSchedule: 'PM A - Basic Service', maintenanceForm: '' });
  }

  getNextMaintenanceData(): Observable<NextMaintenanceData> {
    return of({ date: '05/15/2026', miles: '50,000', hours: '' });
  }

  getTimeClockData(): Observable<TimeClockData> {
    return of({ elapsedTime: '0:00', estimatedCompletionTime: '0:00 - 0:00', timeClockStatus: 'Not Started' });
  }

  getPurchaseOrders(): Observable<PurchaseOrder[]> {
    return of([
      { id: 'PO1', purchaseOrderNumber: '435435926', supplier: 'AM 43453', supplyRoom: 'A Fleet Maintenance Shop', total: 783, baswarePO: '', status: 'Closed' },
    ]);
  }

  getWoServices(): Observable<WoServiceItem[]> {
    return of([
      {
        id: 'SRV1',
        reasonForRepair: '08',
        reasonDescription: 'Preventive Maintenance',
        complaint: 'Oil change and filter replacement',
        alerts: [
          { id: 'A1', dateReported: '20/04/2026', alertType: 'Inspection', priority: 'Low', description: 'broken smth', ticketFaultCode: '' },
        ],
        parts: [
          { id: 'P1', vmrsCode: '032-001', description: 'Oil Filter - Heavy Duty', partNumber: 'FL-2016',   warrantyExpiration: '05/19/2025', manufacturer: 'Fleetguard', failureCode: '', quantity: 1, cost: 45.99, retail: 68.99,  isStock: true,  poNumber: '' },
          { id: 'P2', vmrsCode: '031-001', description: 'Air Filter Element',      partNumber: 'AF-25962', warrantyExpiration: '11/05/2025', manufacturer: 'Fleetguard', failureCode: '', quantity: 1, cost: 89.50, retail: 134.25, isStock: true,  poNumber: '' },
        ],
        labor: [
          { id: 'L1', laborCode: '032-001', description: 'Engine - Lube, Oil and Filter System', complaint: 'Scheduled PM', correction: 'Replaced oil and filter', laborDate: '20/04/2026', workAccomplished: 'Completed oil change and filter replacement', mechanic: 'John Smith', hours: 1.5, cost: 100 },
        ],
        notes: '',
      },
    ]);
  }

  getWoFileAttachments(): Observable<WoFileAttachment[]> {
    return of([]);
  }
}
