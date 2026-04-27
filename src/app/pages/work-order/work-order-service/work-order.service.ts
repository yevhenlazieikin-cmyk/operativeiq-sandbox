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
    return of({
      miles: '124,576',
      hours: '12,170',
    });
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
}
