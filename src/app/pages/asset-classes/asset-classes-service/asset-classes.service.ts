import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type EnabledFlag = 'Enabled' | 'Disabled';

export interface AssetClass {
  id: number;
  name: string;
  description: string;
  verifyOnFrontLine: EnabledFlag;
  scheduling: string;
  displayOnFrontLine: EnabledFlag;
  status: EnabledFlag;
}

// TODO: replace of() stub with real HTTP call when /assets/AssetClassList endpoint is wired up
@Injectable({ providedIn: 'root' })
export class AssetClassesService {
  getAssetClasses(): Observable<AssetClass[]> {
    return of([
      { id: 1,  name: 'Defibrillators',          description: 'AED and manual defibrillators',           verifyOnFrontLine: 'Enabled',  scheduling: 'Monthly',     displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 2,  name: 'Cardiac Monitors',        description: 'Patient cardiac monitoring devices',      verifyOnFrontLine: 'Enabled',  scheduling: 'Monthly',     displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 3,  name: 'Stretchers',              description: 'Powered and manual stretchers',           verifyOnFrontLine: 'Enabled',  scheduling: 'Quarterly',   displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 4,  name: 'Oxygen Cylinders',        description: 'Portable oxygen tanks (M, D, E)',         verifyOnFrontLine: 'Enabled',  scheduling: 'Daily',       displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 5,  name: 'Ventilators',             description: 'Transport and ICU ventilators',           verifyOnFrontLine: 'Enabled',  scheduling: 'Weekly',      displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 6,  name: 'Suction Units',           description: 'Portable suction devices',                verifyOnFrontLine: 'Enabled',  scheduling: 'Weekly',      displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 7,  name: 'Pulse Oximeters',         description: 'SpO2 sensors and monitors',               verifyOnFrontLine: 'Disabled', scheduling: 'Monthly',     displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 8,  name: 'IV Pumps',                description: 'Infusion pumps and accessories',          verifyOnFrontLine: 'Enabled',  scheduling: 'Quarterly',   displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 9,  name: 'Laryngoscopes',           description: 'Direct and video laryngoscopes',          verifyOnFrontLine: 'Enabled',  scheduling: 'Monthly',     displayOnFrontLine: 'Disabled', status: 'Enabled'  },
      { id: 10, name: 'Thermal Imagers',         description: 'Thermal imaging cameras',                 verifyOnFrontLine: 'Disabled', scheduling: 'Annually',    displayOnFrontLine: 'Disabled', status: 'Disabled' },
      { id: 11, name: 'SCBA Units',              description: 'Self-contained breathing apparatus',      verifyOnFrontLine: 'Enabled',  scheduling: 'Monthly',     displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 12, name: 'Hydraulic Rescue Tools',  description: 'Spreaders, cutters, rams',                verifyOnFrontLine: 'Enabled',  scheduling: 'Quarterly',   displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 13, name: 'Fire Hoses',              description: 'Attack and supply lines',                 verifyOnFrontLine: 'Enabled',  scheduling: 'Annually',    displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 14, name: 'Self-Rescue Ropes',       description: 'Personal escape lines',                   verifyOnFrontLine: 'Enabled',  scheduling: 'Annually',    displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 15, name: 'Radios',                  description: 'Portable and mobile radios',              verifyOnFrontLine: 'Disabled', scheduling: 'Daily',       displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 16, name: 'Mobile Data Terminals',   description: 'Vehicle MDTs',                            verifyOnFrontLine: 'Disabled', scheduling: 'Weekly',      displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 17, name: 'Glucometers',             description: 'Blood-glucose monitors',                  verifyOnFrontLine: 'Enabled',  scheduling: 'Monthly',     displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 18, name: 'Capnography Modules',     description: 'EtCO2 measurement units',                 verifyOnFrontLine: 'Enabled',  scheduling: 'Quarterly',   displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 19, name: 'Spineboards',             description: 'Long and short spineboards',              verifyOnFrontLine: 'Enabled',  scheduling: 'Quarterly',   displayOnFrontLine: 'Disabled', status: 'Enabled'  },
      { id: 20, name: 'KED Devices',             description: 'Kendrick extrication devices',            verifyOnFrontLine: 'Disabled', scheduling: 'Annually',    displayOnFrontLine: 'Disabled', status: 'Disabled' },
      { id: 21, name: 'Cervical Collars',        description: 'Adjustable cervical collars',             verifyOnFrontLine: 'Enabled',  scheduling: 'Quarterly',   displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 22, name: 'Trauma Bags',             description: 'ALS / BLS trauma kits',                   verifyOnFrontLine: 'Enabled',  scheduling: 'Daily',       displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 23, name: 'Drug Boxes',              description: 'Sealed narcotic drug boxes',              verifyOnFrontLine: 'Enabled',  scheduling: 'Daily',       displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
      { id: 24, name: 'Cooling Vests',           description: 'Rehab cooling vests',                     verifyOnFrontLine: 'Disabled', scheduling: 'Annually',    displayOnFrontLine: 'Disabled', status: 'Disabled' },
      { id: 25, name: 'Thermal Detectors',       description: 'Temperature spike detectors',             verifyOnFrontLine: 'Enabled',  scheduling: 'Monthly',     displayOnFrontLine: 'Enabled',  status: 'Enabled'  },
    ]);
  }
}
