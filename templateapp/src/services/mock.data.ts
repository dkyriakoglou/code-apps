import type { DataverseRecord } from '../types';

export const mockRecords: DataverseRecord[] = [
  { id: '1', name: 'Acme Corp',        description: 'Cloud migration project',     estimatedvalue: 50000,  closingdate: '2026-08-01', xen_stage: 1 },
  { id: '2', name: 'Globex Inc',       description: 'ERP implementation',          estimatedvalue: 120000, closingdate: '2026-09-15', xen_stage: 2 },
  { id: '3', name: 'Initech LLC',      description: 'Digital transformation',      estimatedvalue: 75000,  closingdate: '2026-07-30', xen_stage: 3 },
  { id: '4', name: 'Umbrella Corp',    description: 'Security audit',              estimatedvalue: 30000,  closingdate: '2026-10-01', xen_stage: 4 },
  { id: '5', name: 'Stark Industries', description: 'AI integration initiative',   estimatedvalue: 200000, closingdate: '2026-12-01', xen_stage: 1 },
];
