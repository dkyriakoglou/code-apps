export interface Stage {
  id: number;
  name: string;
  description: string;
}

export type FormFieldType = 'text' | 'multiline' | 'currency' | 'date';

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
}

export interface DataverseRecord {
  id: string;
  name: string;
  description?: string;
  estimatedvalue?: number;
  closingdate?: string;
  xen_stage: number;
  [key: string]: unknown;
}
